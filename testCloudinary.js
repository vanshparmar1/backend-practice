import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function testUpload() {
  try {
    const result = await cloudinary.uploader.upload(
      "/Users/vansh/Desktop/test.jpg"
    );
    console.log("Upload success ✅");
    console.log(result.secure_url);
  } catch (error) {
    console.error("Upload failed ❌");
    console.error(error.message);
  }
}

testUpload();