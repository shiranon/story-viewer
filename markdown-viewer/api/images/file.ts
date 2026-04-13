import { GetObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3'

import {
  createR2Client,
  parseR2Credentials,
  requireBucketName,
  safeContentType,
} from '../../lib/r2'

import type { VercelRequest, VercelResponse } from '@vercel/node'
import type { Readable } from 'node:stream'


export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
): Promise<void> {
  if (req.method !== 'GET') {
    res.status(405).end()
    return
  }

  const path = req.query.path
  if (!path || typeof path !== 'string' || path.includes('..')) {
    res.status(400).json({ error: 'Invalid path' })
    return
  }

  const client = createR2Client(parseR2Credentials(process.env))
  const bucket = requireBucketName(process.env)
  const ifNoneMatch = req.headers['if-none-match']

  // Conditional request: check ETag via HeadObject
  if (ifNoneMatch) {
    try {
      const head = await client.send(
        new HeadObjectCommand({ Bucket: bucket, Key: path }),
      )
      if (head.ETag && head.ETag === ifNoneMatch) {
        res.status(304).end()
        return
      }
    } catch {
      // Fall through to full fetch
    }
  }

  try {
    const result = await client.send(
      new GetObjectCommand({ Bucket: bucket, Key: path }),
    )

    if (!result.Body) {
      res.status(404).json({ error: 'Not found' })
      return
    }

    res.setHeader('Content-Type', safeContentType(result.ContentType))
    if (result.ContentLength) {
      res.setHeader('Content-Length', result.ContentLength)
    }
    res.setHeader('Cache-Control', 'public, max-age=604800')
    if (result.ETag) {
      res.setHeader('ETag', result.ETag)
    }
    if (result.LastModified) {
      res.setHeader('Last-Modified', result.LastModified.toUTCString())
    }

    const body = result.Body as Readable
    body.pipe(res)
  } catch {
    res.status(404).json({ error: 'Not found' })
  }
}
