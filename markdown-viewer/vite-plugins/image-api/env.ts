import { loadEnv } from 'vite'

import { createR2Client, parseR2Credentials, requireBucketName } from '../../lib/r2'

import type { S3Client } from '@aws-sdk/client-s3'

let envVariables: Record<string, string> = {}

export const loadR2Env = (root: string): void => {
  envVariables = loadEnv('development', root, '')
}

export const getS3Client = (): S3Client => createR2Client(parseR2Credentials(envVariables))

export const getBucketName = (): string => requireBucketName(envVariables)
