// Data Transfer Object for Build filtering in RFQ
import { IsOptional, IsString, IsNumber } from "class-validator";

export class BuildFilterDTO {
  @IsNumber()
  amount: number;

  @IsOptional()
  @IsString()
  cpuId?: string;

  @IsOptional()
  @IsString()
  motherboardId?: string;

  @IsOptional()
  @IsString()
  ramId?: string;

  @IsOptional()
  @IsString()
  gpuId?: string;

  @IsOptional()
  @IsString()
  psuId?: string;

  @IsOptional()
  @IsString()
  driveId?: string;

  @IsOptional()
  @IsString()
  coolerId?: string;

  @IsOptional()
  @IsString()
  caseId?: string;

  @IsString()
  order: "ASC" | "DESC";

  @IsNumber()
  skip: number;

  @IsNumber()
  take: number;
}
