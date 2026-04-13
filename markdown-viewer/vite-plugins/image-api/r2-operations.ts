import { DeleteObjectsCommand, GetObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3'

import { getBucketName, getS3Client } from './env'
import { safeContentType } from '../../lib/r2'

import type { S3Client } from '@aws-sdk/client-s3'
import type { ServerResponse } from 'node:http'
import type { Readable } from 'node:stream'

export const batchDeleteKeys = async (keys: string[]): Promise<number> => {
  if (keys.length === 0) return 0

  const client = getS3Client()
  const bucket = getBucketName()
  let deleted = 0

  for (let index = 0; index < keys.length; index += 1000) {
    const batch = keys.slice(index, index + 1000)
    await client.send(
      new DeleteObjectsCommand({
        Bucket: bucket,
        Delete: {
          Objects: batch.map((Key) => ({ Key })),
          Quiet: true,
        },
      }),
    )
    deleted += batch.length
  }

  return deleted
}

export const listAllKeys = async (): Promise<string[]> => {
  const client = getS3Client()
  const bucket = getBucketName()
  const keys: string[] = []
  let continuationToken: string | undefined

  do {
    const result = await client.send(
      new ListObjectsV2Command({
        Bucket: bucket,
        ContinuationToken: continuationToken,
      }),
    )
    if (result.Contents) {
      for (const object of result.Contents) {
        if (object.Key) keys.push(object.Key)
      }
    }
    continuationToken = result.IsTruncated ? result.NextContinuationToken : undefined
  } while (continuationToken)

  return keys
}

export const fetchAndStreamObject = async (
  client: S3Client,
  bucket: string,
  key: string,
  res: ServerResponse,
): Promise<void> => {
  try {
    const result = await client.send(new GetObjectCommand({ Bucket: bucket, Key: key }))

    if (!result.Body) {
      res.statusCode = 404
      res.end(JSON.stringify({ error: 'Not found' }))
      return
    }

    res.setHeader('Content-Type', safeContentType(result.ContentType))
    if (result.ContentLength) {
      res.setHeader('Content-Length', String(result.ContentLength))
    }
    res.setHeader('Cache-Control', 'public, max-age=604800')
    if (result.ETag) {
      res.setHeader('ETag', result.ETag)
    }
    if (result.LastModified) {
      res.setHeader('Last-Modified', result.LastModified.toUTCString())
    }

    const body = result.Body as Readable
    body.on('error', () => {
      if (!res.headersSent) {
        res.statusCode = 502
        res.end(JSON.stringify({ error: 'Stream error' }))
      }
    })
    body.pipe(res)
  } catch {
    res.statusCode = 404
    res.end(JSON.stringify({ error: 'Not found' }))
  }
}
