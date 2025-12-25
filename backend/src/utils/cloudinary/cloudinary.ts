import { v2 as cloudinary } from "cloudinary";
import { Readable } from "stream";
import { HttpException } from "@/exceptions/http-exceptions";
import { HttpMessages } from "@/exceptions/http-messages.constant";

// Cấu hình Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "",
  api_key: process.env.CLOUDINARY_API_KEY || "",
  api_secret: process.env.CLOUDINARY_API_SECRET || "",
});

export class CloudinaryClient {
  private static instance: CloudinaryClient | null = null;

  private constructor() {
    // Kiểm tra cấu hình
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.warn("⚠️ WARNING: Cloudinary configuration is missing. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET environment variables!");
    }
  }

  public static getInstance() {
    if (this.instance) return this.instance;
    return new CloudinaryClient();
  }

  /**
   * Upload file to Cloudinary
   * @param file - Express.Multer.File object
   * @returns Object containing fileName and url
   */
  public async upload(file: Express.Multer.File): Promise<{
    fileName: string;
    url: string;
  } | null> {
    try {
      if (!file || !file.buffer) {
        throw new HttpException(400, HttpMessages._BAD_REQUEST);
      }

      // Convert buffer to stream
      const stream = Readable.from(file.buffer);

      // Generate unique filename with timestamp
      const timestamp = new Date().getTime();
      const publicId = `uploads/${timestamp}-${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

      // Upload to Cloudinary using upload_stream
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            public_id: publicId,
            folder: process.env.CLOUDINARY_FOLDER || "technical-store",
            resource_type: "auto", // Tự động phát hiện loại file (image, video, etc.)
          },
          (error, result) => {
            if (error) {
              console.error("Cloudinary upload error:", error);
              reject(error);
              return;
            }

            if (result) {
              resolve({
                fileName: result.public_id,
                url: result.secure_url, // Sử dụng secure_url (HTTPS)
              });
            } else {
              reject(new Error("Upload failed: No result returned"));
            }
          }
        );

        stream.pipe(uploadStream);
      });
    } catch (error) {
      console.error("Cloudinary upload exception:", error);
      return null;
    }
  }

  /**
   * Remove file from Cloudinary
   * @param publicId - Cloudinary public_id of the file to delete
   * @returns Object containing success status and message
   */
  public async remove(publicId: string): Promise<{
    success: boolean;
    message: string;
  } | null> {
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      
      if (result.result === "ok" || result.result === "not found") {
        return {
          success: true,
          message: "deleted successfully",
        };
      }

      return {
        success: false,
        message: result.result || "unknown error",
      };
    } catch (error) {
      console.error("Cloudinary delete error:", error);
      return null;
    }
  }
}














