import { useEffect, useState } from 'react'

function loadImage(file: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => { URL.revokeObjectURL(url); resolve(img) }
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Не удалось открыть фото')) }
    img.src = url
  })
}

function resize(img: HTMLImageElement, max: number, quality: number): Promise<Blob> {
  const scale = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(img.naturalWidth * scale)
  canvas.height = Math.round(img.naturalHeight * scale)
  canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height)
  return new Promise((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Не удалось сжать фото'))), 'image/jpeg', quality))
}

export async function compressPhoto(file: Blob) {
  const img = await loadImage(file)
  const [blob, thumb] = await Promise.all([resize(img, 1600, 0.85), resize(img, 400, 0.75)])
  return { blob, thumb }
}

export function useObjectURL(blob?: Blob) {
  const [url, setUrl] = useState<string>()
  useEffect(() => {
    if (!blob) return setUrl(undefined)
    const u = URL.createObjectURL(blob)
    setUrl(u)
    return () => URL.revokeObjectURL(u)
  }, [blob])
  return url
}
