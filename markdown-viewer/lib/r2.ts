import { S3Client } from '@aws-sdk/client-s3'

import { ALLOWED_IMAGE_EXTENSIONS } from '../src/lib/image-types'

const getExtension = (filename: string): string => {
  const dot = filename.lastIndexOf('.')
  return dot === -1 ? '' : filename.slice(dot)
}

export type { ImageOutfit, ImageCharacter, ImagesData } from '../src/lib/image-types'

export interface R2Credentials {
  accountId: string
  accessKeyId: string
  secretAccessKey: string
}

export const SAFE_CONTENT_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/avif',
])

export const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export const safeContentType = (contentType: string | undefined): string =>
  contentType !== undefined && SAFE_CONTENT_TYPES.has(contentType)
    ? contentType
    : 'application/octet-stream'

const PATH_SEGMENT_UNSAFE_RE = /[^\w.\-\u3000-\u9FFF\uF900-\uFAFF]/g

export const sanitizePathSegment = (segment: string): string =>
  segment.replaceAll(PATH_SEGMENT_UNSAFE_RE, '_')

export const validateImageFilename = (filename: string): boolean => {
  const extension = getExtension(filename).toLowerCase()
  return (
    ALLOWED_IMAGE_EXTENSIONS.has(extension) && !filename.includes('/') && !filename.includes('..')
  )
}

let cachedClient: S3Client | null = null
let cachedFingerprint = ''

export const createR2Client = (credentials: R2Credentials): S3Client => {
  const fingerprint = `${credentials.accountId}|${credentials.accessKeyId}|${credentials.secretAccessKey}`
  if (cachedClient && cachedFingerprint === fingerprint) return cachedClient

  cachedClient = new S3Client({
    region: 'auto',
    endpoint: `https://${credentials.accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: credentials.accessKeyId,
      secretAccessKey: credentials.secretAccessKey,
    },
  })
  cachedFingerprint = fingerprint

  return cachedClient
}

export const parseR2Credentials = (env: Record<string, string | undefined>): R2Credentials => {
  const accountId = env.R2_ACCOUNT_ID
  const accessKeyId = env.R2_ACCESS_KEY_ID
  const secretAccessKey = env.R2_SECRET_ACCESS_KEY

  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error(
      'R2 credentials missing: set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY',
    )
  }

  return { accountId, accessKeyId, secretAccessKey }
}

export const requireBucketName = (env: Record<string, string | undefined>): string => {
  const bucket = env.R2_BUCKET_NAME
  if (!bucket) {
    throw new Error('R2_BUCKET_NAME not configured')
  }
  return bucket
}
