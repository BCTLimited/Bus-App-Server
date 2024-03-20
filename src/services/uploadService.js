import cloudinary from "../utils/cloudinaryConfig";

exports.uploadUserImage = async (tempFilePath) => {
  try {
    const { secure_url } = await cloudinary.uploader.upload(tempFilePath, {
      use_filename: true,
      folder: "BUS-App",
    });
    return secure_url;
  } catch (error) {
    throw error;
  }
};

export { uploadUserImage };
