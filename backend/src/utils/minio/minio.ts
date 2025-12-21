import { Client } from "minio";
import { convertToURL } from "../conversions/string-to-url";
import { HttpException } from "@/exceptions/http-exceptions";
import { HttpMessages } from "@/exceptions/http-messages.constant";


const bucket = process.env.MINIO_BUCKET || "";
const url = `https://${process.env.MINIO_ENDPOINT}/${process.env.MINIO_BUCKET}/` || "";

export class MinioClient {
  private minioClient: Client | null = null;
  private static instance: MinioClient | null = null;
  private constructor() {
    this.minioClient = new Client({
      endPoint: process.env.MINIO_ENDPOINT || "localhost",
      useSSL: process.env.MINIO_USE_SSL === "true" || true,
      accessKey: process.env.MINIO_ACCESS_KEY || "",
      secretKey: process.env.MINIO_SECRET_KEY || "",
    });
  }

  public static getInstance() {
    if (this.instance) return this.instance;
    return new MinioClient();
  }

  public async upload(item: Express.Multer.File) {
    if (this.minioClient) {
      const fileName = convertToURL(
        new Date().getTime() + "-" + item.originalname
      );
      await this.minioClient.putObject(
        bucket,
        fileName,
        item.buffer,
        item.size,
        { "content-type": item.mimetype }
      );
      return {
        fileName,
        url: `${url}${fileName}`,
      };
    }
    return null;
  }

  public async remove(fileName: string): Promise<{
    success: boolean;
    message: string;
  } | null> {
    try {
      if (!this.minioClient)
        throw new HttpException(400, HttpMessages._BAD_REQUEST);
      await this.minioClient.removeObject(bucket, fileName);
      return { success: true, message: "deleted successfully" };
    } catch (error) {
      console.log(error);
      return null;
    }
  }
}
