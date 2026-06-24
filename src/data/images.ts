import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getStorageInstance } from '../firebase/app';
import { storageAvailable } from '../firebase/config';

/** Map-image handling: upload to Firebase Storage when configured, else inline data URL. */

const INLINE_MAX = 1.5 * 1024 * 1024; // ~1.5 MB for the RTDB-inline fallback
const STORAGE_MAX = 12 * 1024 * 1024; // 12 MB when Storage is available

export function loadImageSize(
  src: string,
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => reject(new Error('Could not read that image.'));
    img.src = src;
  });
}

function readDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Could not read that file.'));
    reader.readAsDataURL(file);
  });
}

export interface PreparedImage {
  imageUrl: string;
  width: number;
  height: number;
  /** True if uploaded to Storage; false if inlined as a data URL. */
  stored: boolean;
}

export async function prepareMapImage(
  gameId: string,
  file: File,
): Promise<PreparedImage> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Please choose an image file.');
  }

  const objectUrl = URL.createObjectURL(file);
  let dims: { width: number; height: number };
  try {
    dims = await loadImageSize(objectUrl);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }

  if (storageAvailable) {
    if (file.size > STORAGE_MAX) throw new Error('Image too large (max 12 MB).');
    const safeName = file.name.replace(/[^\w.-]/g, '_');
    const ref = storageRef(getStorageInstance(), `maps/${gameId}/${Date.now()}-${safeName}`);
    await uploadBytes(ref, file);
    const url = await getDownloadURL(ref);
    return { imageUrl: url, ...dims, stored: true };
  }

  if (file.size > INLINE_MAX) {
    throw new Error(
      'Image too large for inline storage (max ~1.5 MB). Configure Firebase Storage for bigger maps.',
    );
  }
  const dataUrl = await readDataUrl(file);
  return { imageUrl: dataUrl, ...dims, stored: false };
}
