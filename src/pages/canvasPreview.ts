// canvasPreview.js
export function canvasPreview(
  image,
  canvas,
  crop,
  scale = 1,
  rotate = 0
) {
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('No 2d context');
  }

  // Set canvas size to match the crop dimensions
  canvas.width = crop.width;
  canvas.height = crop.height;

  // Clear the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Save the current context state
  ctx.save();

  // Move to the center of the canvas
  ctx.translate(canvas.width / 2, canvas.height / 2);

  // Rotate around the center
  ctx.rotate((rotate * Math.PI) / 180);

  // Scale from the center
  ctx.scale(scale, scale);

  // Move back to apply the crop
  ctx.translate(-crop.x - crop.width / 2, -crop.y - crop.height / 2);

  // Draw the image
  ctx.drawImage(
    image,
    0,
    0,
    image.naturalWidth,
    image.naturalHeight
  );

  // Restore the context state
  ctx.restore();
}