// Without Firebase Storage, the map image has to live as a string in the
// Realtime Database, so we downscale + re-encode it first to keep the
// payload reasonable (RTDB isn't built for multi-MB blobs).
const MAX_DIMENSION = 1600
const JPEG_QUALITY = 0.82

export function imageToDataUrl(image) {
  const scale = Math.min(1, MAX_DIMENSION / Math.max(image.width, image.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(image.width * scale)
  canvas.height = Math.round(image.height * scale)

  const ctx = canvas.getContext('2d')
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height)

  return canvas.toDataURL('image/jpeg', JPEG_QUALITY)
}
