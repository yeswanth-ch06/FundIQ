import cloudinary from "../config/cloudinary.js";

/**
 * Streams a Multer memory-buffer file up to Cloudinary.
 * @param {Buffer} buffer
 * @param {string} folder - Cloudinary folder, e.g. "startups/logos"
 * @param {"image"|"raw"} resourceType - "raw" for PDFs
 * @returns {Promise<{url: string, publicId: string}>}
 */
export const uploadBufferToCloudinary = (buffer, folder, resourceType = "image") => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: resourceType },
      (error, result) => {
        if (error) return reject(error);
        resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );
    stream.end(buffer);
  });
};

export const deleteFromCloudinary = (publicId, resourceType = "image") => {
  if (!publicId) return Promise.resolve();
  return cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
};
