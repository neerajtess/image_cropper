/**
 * Formats the file size in bytes to a human-readable string.
 * @param {number} bytes - The file size in bytes.
 * @returns {string} - The formatted file size (e.g., "1.23 MB").
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

/**
 * Crops an image based on the specified crop dimensions.
 * @param {HTMLImageElement} image - The image element to crop.
 * @param {Object} crop - The crop dimensions (x, y, width, height).
 * @returns {string} - The cropped image as a data URL.
 */
export const getCroppedImg = (image, crop) => {
  const canvas = document.createElement("canvas");
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;
  canvas.width = crop.width;
  canvas.height = crop.height;
  const ctx = canvas.getContext("2d");

  ctx.drawImage(
    image,
    crop.x * scaleX,
    crop.y * scaleY,
    crop.width * scaleX,
    crop.height * scaleY,
    0,
    0,
    crop.width,
    crop.height
  );

  return canvas.toDataURL("image/jpeg");
};