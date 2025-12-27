import { IsArray, IsString, IsUUID } from "class-validator";

export class AttachImageDto {
    @IsUUID()
    query: string;

    @IsArray()
    @IsString({ each: true })
    imagesURLs: string[];
}