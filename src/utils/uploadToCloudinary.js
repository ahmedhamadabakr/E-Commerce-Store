import { v2 as cloudinary } from "cloudinary";

// إعدادات Cloudinary من env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// دالة لرفع صورة واحدة باستخدام stream
export async function uploadToCloudinary(file, folder = "products") {
  if (typeof file !== "object" || !file.arrayBuffer) {
    throw new Error("Invalid file format");
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });
}
