export interface ImageOutfit {
  name: string
  images: string[]
}

export interface ImageCharacter {
  name: string
  outfits: ImageOutfit[]
}

export interface ImagesData {
  characters: ImageCharacter[]
}

export const ALLOWED_IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif'])
