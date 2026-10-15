export interface Photo {
  id: string
  title: string
  description?: string
  uploadedAt: string
  date: string
  tags: string[]
  src: string
  thumb: string
  exif?: {
    camera?: string
    lens?: string
    focalLength?: string
    aperture?: string
    shutterSpeed?: string
    iso?: number
    dateTime?: string
  }
}

export interface PhotoCategory {
  id: string
  name: string
  nameZh: string
  count: number
}
