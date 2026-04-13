import { ref } from 'vue'

import { uploadImages } from '@/lib/api'

export interface UploadTask {
  character: string
  outfit: string
  files: File[]
}

interface UploadProgress {
  total: number
  processed: number
  failed: number
  active: boolean
}

const BATCH_SIZE = 20
const MAX_CONCURRENCY = 4

const createBatches = (tasks: UploadTask[]): UploadTask[] => {
  const batches: UploadTask[] = []

  for (const task of tasks) {
    for (let index = 0; index < task.files.length; index += BATCH_SIZE) {
      batches.push({
        character: task.character,
        outfit: task.outfit,
        files: task.files.slice(index, index + BATCH_SIZE),
      })
    }
  }

  return batches
}

export const useUploadQueue = () => {
  const progress = ref<UploadProgress>({
    total: 0,
    processed: 0,
    failed: 0,
    active: false,
  })

  let cancelled = false

  const start = async (tasks: UploadTask[], onComplete?: () => Promise<void>): Promise<void> => {
    if (progress.value.active) return

    const batches = createBatches(tasks)
    const totalFiles = tasks.reduce((sum, t) => sum + t.files.length, 0)

    cancelled = false
    progress.value = { total: totalFiles, processed: 0, failed: 0, active: true }

    let batchIndex = 0

    const processNext = async (): Promise<void> => {
      while (!cancelled) {
        const index = batchIndex++
        if (index >= batches.length) return

        const batch = batches[index]
        if (!batch) return
        try {
          await uploadImages(batch.character, batch.outfit, batch.files)
          progress.value = {
            ...progress.value,
            processed: progress.value.processed + batch.files.length,
          }
        } catch {
          progress.value = {
            ...progress.value,
            failed: progress.value.failed + batch.files.length,
            processed: progress.value.processed + batch.files.length,
          }
        }
      }
    }

    const workers = Array.from({ length: Math.min(MAX_CONCURRENCY, batches.length) }, () =>
      processNext(),
    )

    await Promise.all(workers)

    progress.value = { ...progress.value, active: false }

    if (onComplete) {
      await onComplete()
    }
  }

  const cancel = () => {
    cancelled = true
  }

  return {
    progress,
    start,
    cancel,
  }
}
