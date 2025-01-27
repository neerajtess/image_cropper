export function centerAspectCrop(mediaWidth, mediaHeight, aspect) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: "%",
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight
    ),
    mediaWidth,
    mediaHeight
  );
}

export function convertToPixelCrop(percentageCrop, imgWidth, imgHeight) {
  return {
    x: (percentageCrop.x / 100) * imgWidth,
    y: (percentageCrop.y / 100) * imgHeight,
    width: (percentageCrop.width / 100) * imgWidth,
    height: (percentageCrop.height / 100) * imgHeight,
  };
}
