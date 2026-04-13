import { readFile, writeFile } from 'node:fs/promises'

import { naturalSort } from '../../lib/story-scanner'

import type { ImagesData } from '../../lib/r2'

let writeQueue: Promise<void> = Promise.resolve()

export const readImagesJson = async (filePath: string): Promise<ImagesData> => {
  try {
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    const raw = await readFile(filePath, 'utf8')
    return JSON.parse(raw) as ImagesData
  } catch {
    return { characters: [] }
  }
}

export const writeImagesJson = async (filePath: string, data: ImagesData): Promise<void> => {
  const sorted = {
    characters: [...data.characters]
      .toSorted((a, b) => naturalSort(a.name, b.name))
      .map((char) => ({
        ...char,
        outfits: [...char.outfits]
          .toSorted((a, b) => naturalSort(a.name, b.name))
          .map((outfit) => ({
            ...outfit,
            images: [...outfit.images].toSorted(naturalSort),
          })),
      })),
  }
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  await writeFile(filePath, JSON.stringify(sorted, null, 2) + '\n')
}

export const enqueueWrite = async (
  filePath: string,
  updater: (data: ImagesData) => ImagesData,
): Promise<void> => {
  const previous = writeQueue
  writeQueue = (async () => {
    await previous
    const data = await readImagesJson(filePath)
    const updated = updater(data)
    await writeImagesJson(filePath, updated)
  })()
  return writeQueue
}

export const addImageEntry = (
  data: ImagesData,
  characterName: string,
  outfitName: string,
  filename: string,
): ImagesData => {
  const characters = [...data.characters]
  let char = characters.find((c) => c.name === characterName)
  if (char) {
    const index = characters.indexOf(char)
    char = { ...char, outfits: [...char.outfits] }
    characters[index] = char
  } else {
    char = { name: characterName, outfits: [] }
    characters.push(char)
  }

  let outfit = char.outfits.find((o) => o.name === outfitName)
  if (outfit) {
    const index = char.outfits.indexOf(outfit)
    outfit = { ...outfit, images: [...outfit.images] }
    char.outfits[index] = outfit
  } else {
    outfit = { name: outfitName, images: [] }
    char.outfits.push(outfit)
  }

  if (!outfit.images.includes(filename)) {
    outfit.images.push(filename)
  }

  return { characters }
}

export const removeImageEntry = (
  data: ImagesData,
  characterName: string,
  outfitName: string,
  filename: string,
): ImagesData => {
  const characters = data.characters
    .map((char) => {
      if (char.name !== characterName) return char
      const outfits = char.outfits
        .map((outfit) => {
          if (outfit.name !== outfitName) return outfit
          return {
            ...outfit,
            images: outfit.images.filter((img) => img !== filename),
          }
        })
        .filter((outfit) => outfit.images.length > 0)
      return { ...char, outfits }
    })
    .filter((char) => char.outfits.length > 0)

  return { characters }
}

export const removeCharacterEntry = (data: ImagesData, characterName: string): ImagesData => ({
  characters: data.characters.filter((char) => char.name !== characterName),
})

export const buildCharacterKeys = (data: ImagesData, characterName: string): string[] => {
  const char = data.characters.find((c) => c.name === characterName)
  if (!char) return []
  return char.outfits.flatMap((outfit) =>
    outfit.images.map((img) => `${characterName}/${outfit.name}/${img}`),
  )
}
