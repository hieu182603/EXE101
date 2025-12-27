import { EntityNotFoundException, NoFileUploadedException, BadRequestException } from "@/exceptions/http-exceptions";
import { CloudinaryClient } from "@/utils/cloudinary/cloudinary";
import { Service } from "typedi";
import { Image } from "./image.entity";
import { Product } from "@/product/product.entity";
import { In } from "typeorm";
import { Feedback } from "@/feedback/feedback.entity";
import { Account } from "@/auth/account/account.entity";

@Service()
export class ImageService {

  async uploadImage(file: Express.Multer.File) {
    if (!file) throw new NoFileUploadedException;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.');
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      throw new BadRequestException('File size too large. Maximum size is 5MB.');
    }

      const uploadedFile = await CloudinaryClient.getInstance().upload(file);
      const newImage = new Image();
      newImage.originalName = file.originalname;
      newImage.name = uploadedFile ? uploadedFile.fileName : '';
      newImage.url = uploadedFile ? uploadedFile.url : '';
      await newImage.save();
      return newImage;
  }

  async attachImagesToProduct(productId: string, imagesURLs: string[]){
    const product = await Product.findOne({ where: { id: productId } });
    if (!product) throw new EntityNotFoundException("Product");
    const images = await Image.find({ where: { url: In(imagesURLs) } });
    product.images = images;
    await product.save();
    return product;
  }

  async attachImagesToFeedback(feedbackId: string, imagesURLs: string[]){
    const feedback = await Feedback.findOne({ where: { id: feedbackId } });
    if (!feedback) throw new EntityNotFoundException("Feedback");
    const images = await Image.find({ where: { url: In(imagesURLs) } });
    feedback.images = images;
    await feedback.save();
    return feedback;
  }
}
