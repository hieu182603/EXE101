import {
  Post,
  UploadedFile,
  BadRequestError,
  Controller,
  Body,
} from "routing-controllers";
import { Service } from "typedi";
import { ImageService } from "./image.service";
import { AttachImageDto } from "./image.dto";

@Service()
@Controller("/image")
export class ImageController {
  constructor(private readonly imageService: ImageService) {}
  
  @Post("/upload")
  async upload(@UploadedFile("file") file: Express.Multer.File) {
    const newImage = await this.imageService.uploadImage(file);
    return newImage;
  }

  @Post("/attach-to-product")
  async attachToProduct(@Body() body: AttachImageDto) {
    const product = await this.imageService.attachImagesToProduct(body.query, body.imagesURL);
    return "Success";
  }

  @Post("/attach-to-feedback")
  async attachToFeedback(@Body() body: AttachImageDto) {
    const feedback = await this.imageService.attachImagesToFeedback(body.query, body.imagesURL);
    return "Success";
  }
}
