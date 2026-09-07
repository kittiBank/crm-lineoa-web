/**
 * Capture a JPEG thumbnail from the first readable frame of a video file.
 */
export async function captureVideoThumbnail(file: File): Promise<File> {
  const objectUrl = URL.createObjectURL(file);

  try {
    const video = document.createElement("video");
    video.preload = "auto";
    video.muted = true;
    video.playsInline = true;
    video.src = objectUrl;

    await new Promise<void>((resolve, reject) => {
      const onLoaded = () => resolve();
      const onError = () => reject(new Error("Failed to load video for thumbnail"));
      video.addEventListener("loadeddata", onLoaded, { once: true });
      video.addEventListener("error", onError, { once: true });
    });

    const seekTo = Math.min(0.1, Math.max(0, (video.duration || 1) / 10));
    if (Number.isFinite(video.duration) && video.duration > 0) {
      await new Promise<void>((resolve, reject) => {
        const onSeeked = () => resolve();
        const onError = () =>
          reject(new Error("Failed to seek video for thumbnail"));
        video.addEventListener("seeked", onSeeked, { once: true });
        video.addEventListener("error", onError, { once: true });
        video.currentTime = seekTo;
      });
    }

    const width = video.videoWidth || 1040;
    const height = video.videoHeight || 1040;
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("Failed to create thumbnail canvas");
    }

    context.drawImage(video, 0, 0, width, height);

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (result) => {
          if (result) {
            resolve(result);
            return;
          }
          reject(new Error("Failed to create thumbnail image"));
        },
        "image/jpeg",
        0.85,
      );
    });

    return new File([blob], "video-thumbnail.jpg", { type: "image/jpeg" });
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}
