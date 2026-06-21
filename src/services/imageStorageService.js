import { imageToDataUrl } from '../utils/resizeImage.js'

// Single seam for "turn an Image into something storable" — today that's
// just a compressed data URL (no Firebase Storage on the free plan), but
// swapping to Storage later (upload + return a download URL) only means
// changing this function, not every call site that uploads an image.
export function uploadImage(image, maxDimension, quality) {
  return Promise.resolve(imageToDataUrl(image, maxDimension, quality))
}
