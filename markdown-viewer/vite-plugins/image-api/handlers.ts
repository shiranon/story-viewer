import { text as streamText } from 'node:stream/consumers'

import { DeleteObjectCommand, HeadObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'

import { getBucketName, getS3Client } from './env'
import {
  addImageEntry,
  buildCharacterKeys,
  enqueueWrite,
  readImagesJson,
  removeCharacterEntry,
  removeImageEntry,
} from './images-json'
import { batchDeleteKeys, fetchAndStreamObject, listAllKeys } from './r2-operations'
import {
  MAX_FILE_COUNT,
  MAX_FILE_SIZE,
  sanitizePathSegment,
  validateImageFilename,
} from '../../lib/r2'

import type Busboy from 'busboy'
import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Readable } from 'node:stream'

export async function handleGetImages(imagesJsonPath: string, res: ServerResponse): Promise<void> {
  try {
    const data = await readImagesJson(imagesJsonPath)
    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    res.end(JSON.stringify(data))
  } catch (error: unknown) {
    res.statusCode = 500
    res.end(JSON.stringify({ error: String(error) }))
  }
}

export async function handleGetImageFile(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const url = new URL(req.url ?? '', 'http://localhost')
  const filePath = url.searchParams.get('path')

  if (!filePath || filePath.includes('..')) {
    res.statusCode = 400
    res.end(JSON.stringify({ error: 'Invalid path' }))
    return
  }

  const client = getS3Client()
  const bucket = getBucketName()
  const ifNoneMatch = req.headers['if-none-match']

  if (ifNoneMatch) {
    try {
      const head = await client.send(new HeadObjectCommand({ Bucket: bucket, Key: filePath }))
      if (head.ETag && head.ETag === ifNoneMatch) {
        res.statusCode = 304
        res.end()
        return
      }
    } catch {
      // Fall through to fetch the object
    }
  }

  await fetchAndStreamObject(client, bucket, filePath, res)
}

interface UploadContext {
  fields: Record<string, string>
  uploadedFiles: string[]
  errors: string[]
  fileCount: number
  filesProcessed: number
  imagesJsonPath: string
  onAllFilesProcessed: () => void
}

function processFileEnd(
  buffer: Buffer,
  info: { filename: string; mimeType: string },
  context: UploadContext,
): void {
  const { filename, mimeType } = info
  const character = context.fields.character
  const outfit = context.fields.outfit

  if (!character || !outfit || !filename) {
    context.errors.push(`Missing metadata for file: ${filename}`)
    context.filesProcessed++
    return
  }

  if (!validateImageFilename(filename)) {
    context.errors.push(`Invalid filename or extension: ${filename}`)
    context.filesProcessed++
    return
  }

  const safeCharacter = sanitizePathSegment(character)
  const safeOutfit = sanitizePathSegment(outfit)
  const key = `${safeCharacter}/${safeOutfit}/${filename}`
  const client = getS3Client()
  const bucket = getBucketName()

  void client
    .send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: buffer,
        ContentType: mimeType || 'application/octet-stream',
      }),
    )
    .then(() => {
      context.uploadedFiles.push(filename)
      return enqueueWrite(context.imagesJsonPath, (data) =>
        addImageEntry(data, safeCharacter, safeOutfit, filename),
      )
    })
    .catch((error: unknown) => {
      context.errors.push(`Failed to upload ${filename}: ${String(error)}`)
    })
    .finally(() => {
      context.filesProcessed++
      if (context.filesProcessed === context.fileCount) {
        context.onAllFilesProcessed()
      }
    })
}

function handleBusboyFile(
  fileStream: Readable,
  info: { filename: string; mimeType: string },
  context: UploadContext,
): void {
  const chunks: Buffer[] = []
  fileStream.on('data', (chunk: Buffer) => chunks.push(chunk))
  fileStream.on('end', () => {
    processFileEnd(Buffer.concat(chunks), info, context)
  })
}

export async function handleUpload(
  req: IncomingMessage,
  res: ServerResponse,
  imagesJsonPath: string,
): Promise<void> {
  const { default: createBusboy } = await import('busboy')
  const bb = (createBusboy as unknown as typeof Busboy)({
    headers: req.headers,
    defParamCharset: 'utf8',
    limits: { fileSize: MAX_FILE_SIZE, files: MAX_FILE_COUNT },
  })

  const uploadContext: UploadContext = {
    fields: {},
    uploadedFiles: [],
    errors: [],
    fileCount: 0,
    filesProcessed: 0,
    imagesJsonPath,
    onAllFilesProcessed: () => {
      res.setHeader('Content-Type', 'application/json; charset=utf-8')
      res.end(
        JSON.stringify({
          success: uploadContext.errors.length === 0,
          uploaded: uploadContext.uploadedFiles,
          errors: uploadContext.errors,
        }),
      )
    },
  }

  bb.on('field', (name: string, value: string) => {
    uploadContext.fields[name] = value
  })

  bb.on(
    'file',
    (_fieldname: string, fileStream: Readable, info: { filename: string; mimeType: string }) => {
      uploadContext.fileCount++
      handleBusboyFile(fileStream, info, uploadContext)
    },
  )

  bb.on('finish', () => {
    if (uploadContext.fileCount === 0) {
      res.statusCode = 400
      res.end(JSON.stringify({ error: 'No files provided' }))
    }
  })

  bb.on('error', (error: Error) => {
    res.statusCode = 500
    res.end(JSON.stringify({ error: error.message }))
  })

  req.pipe(bb)
}

export async function handleDelete(
  req: IncomingMessage,
  res: ServerResponse,
  imagesJsonPath: string,
): Promise<void> {
  try {
    const body = await streamText(req as unknown as Readable)
    const { character, outfit, filename } = JSON.parse(body) as {
      character: string
      outfit: string
      filename: string
    }

    if (!character || !outfit || !filename) {
      res.statusCode = 400
      res.end(JSON.stringify({ error: 'Missing character, outfit, or filename' }))
      return
    }

    const key = `${character}/${outfit}/${filename}`
    const client = getS3Client()
    const bucket = getBucketName()

    await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }))

    await enqueueWrite(imagesJsonPath, (data) =>
      removeImageEntry(data, character, outfit, filename),
    )

    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    res.end(JSON.stringify({ success: true }))
  } catch {
    res.statusCode = 500
    res.end(JSON.stringify({ error: 'Delete failed' }))
  }
}

export async function handleDeleteCharacter(
  req: IncomingMessage,
  res: ServerResponse,
  imagesJsonPath: string,
): Promise<void> {
  try {
    const body = await streamText(req as unknown as Readable)
    const { character } = JSON.parse(body) as { character: string }

    if (!character) {
      res.statusCode = 400
      res.end(JSON.stringify({ error: 'Missing character' }))
      return
    }

    let keysToDelete: string[] = []
    await enqueueWrite(imagesJsonPath, (data) => {
      keysToDelete = buildCharacterKeys(data, character)
      return removeCharacterEntry(data, character)
    })

    const deleted = await batchDeleteKeys(keysToDelete)

    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    res.end(JSON.stringify({ success: true, deleted }))
  } catch {
    res.statusCode = 500
    res.end(JSON.stringify({ error: 'Delete character failed' }))
  }
}

export async function handleDeleteAll(res: ServerResponse, imagesJsonPath: string): Promise<void> {
  try {
    const keys = await listAllKeys()
    const deleted = await batchDeleteKeys(keys)

    await enqueueWrite(imagesJsonPath, () => ({ characters: [] }))

    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    res.end(JSON.stringify({ success: true, deleted }))
  } catch {
    res.statusCode = 500
    res.end(JSON.stringify({ error: 'Delete all failed' }))
  }
}
