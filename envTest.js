import dotenv from "dotenv";

dotenv.config({ path: "./.env" });

console.log("PORT:", process.env.PORT);
console.log("Cloud name:", process.env.CLOUDINARY_CLOUD_NAME);
console.log("API key:", process.env.CLOUDINARY_API_KEY);
console.log("API secret:", process.env.CLOUDINARY_API_SECRET);