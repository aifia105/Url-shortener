import {
  IsUrl,
  IsOptional,
  IsArray,
  IsString,
  IsDateString,
} from 'class-validator';

export class CreateUrlDto {
  @IsUrl({}, { message: 'Please provide a valid URL' })
  originalUrl: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsDateString({}, { message: 'Please provide a valid date string' })
  expiresAt?: string;
}

export class UrlResponseDto {
  shortCode: string;
  originalUrl: string;
  shortUrl: string;
  tags: string[];
  isActive: boolean;
  lastAccessedAt?: Date;
}
