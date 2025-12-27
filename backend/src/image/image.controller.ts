import { Body, Controller, Post, UseBefore, Req } from "routing-controllers";
import { Service } from "typedi";
import { ImageService } from "./image.service";
import { AttachImageDto } from "./image.dto";
import multer from "multer";
import { Request } from "express";

const upload = multer({ storage: multer.memoryStorage() });

@Service()
@Controller("/image")
export class ImageController {
  constructor(private readonly imageService: ImageService) {}

  @Post("/upload")
  @UseBefore(upload.single("file"))
  async upload(@Req() req: Request) {
    const file = req.file as Express.Multer.File | undefined;
    const newImage = await this.imageService.uploadImage(file as Express.Multer.File);
    return {
      success: true,
      message: "Image uploaded successfully",
      data: newImage,
    };
  }

  @Post("/attach-to-product")
  async attachToProduct(@Body() body: AttachImageDto) {
    const product = await this.imageService.attachImagesToProduct(body.query, body.imagesURLs);
    return { message: "Images attached to product successfully", product };
  }

  @Post("/attach-to-feedback")
  async attachToFeedback(@Body() body: AttachImageDto) {
    const feedback = await this.imageService.attachImagesToFeedback(body.query, body.imagesURLs);
    return { message: "Images attached to feedback successfully", feedback };
  }
}


