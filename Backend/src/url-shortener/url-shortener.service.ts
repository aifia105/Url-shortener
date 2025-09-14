import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cron } from '@nestjs/schedule';
import {
  UrlShortener,
  UrlShortenerDocument,
} from './entities/url-shortener.schema';
import { Model } from 'mongoose';
import { CreateUrlDto, UrlResponseDto } from './dto/url-shortener.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UrlShortenerService {
  private readonly logger = new Logger(UrlShortenerService.name);

  constructor(
    @InjectModel(UrlShortener.name)
    private urlShortenerModel: Model<UrlShortenerDocument>,
    private configService: ConfigService,
  ) {}

  async shortenUrl(createUrlDto: CreateUrlDto): Promise<UrlResponseDto> {
    try {
      const { originalUrl, tags = [], expiresAt } = createUrlDto;
      const isActive = true;
      const shortCodeLength = parseInt(
        this.configService.get<string>('SHORT_CODE_LENGTH') || '8',
      );

      if (!originalUrl) {
        throw new BadRequestException('Original URL is required');
      }

      const existingUrl = await this.urlShortenerModel.findOne({
        originalUrl,
        isActive: true,
        $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }],
      });

      if (existingUrl) {
        this.logger.log('Existing active short URL found, returning it.');
        return this.formatUrlResponse(existingUrl);
      }

      const shortCode = this.generateShortCode(shortCodeLength);

      this.logger.log('Creating new short URL with code: ' + shortCode);

      const expirationDate = expiresAt ? new Date(expiresAt) : null;

      const shortUrl = new this.urlShortenerModel({
        originalUrl,
        shortCode,
        tags,
        expiresAt: expirationDate,
        isActive,
      });

      this.logger.log('Creating new short URL with code: ' + shortCode);

      await shortUrl.save();
      return this.formatUrlResponse(shortUrl);
    } catch (error) {
      console.error(error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new Error(`Error creating a shortened url: ${error.message}`);
    }
  }

  private generateShortCode(codeNb: number): string {
    try {
      let code = '';
      const chars = this.configService.get<string>('SECRET');
      for (let i = 0; i < codeNb; i++) {
        const random = Math.floor(Math.random() * 62);
        code += chars[random];
      }
      return code;
    } catch (error) {
      console.error(error);
      throw new Error(`Error generating a short code: ${error.message}`);
    }
  }

  async getOriginalUrl(shortCode: string): Promise<string> {
    try {
      const shortUrl = await this.urlShortenerModel
        .findOne({ shortCode })
        .exec();

      if (!shortUrl) {
        this.logger.warn('Short URL not found');
        throw new NotFoundException('Short URL not found');
      }

      if (!shortUrl.isActive) {
        this.logger.warn('Short URL is not active');
        throw new NotFoundException('Short URL is not active');
      }

      if (shortUrl.expiresAt && shortUrl.expiresAt <= new Date()) {
        shortUrl.isActive = false;
        await shortUrl.save();
        this.logger.warn('Short URL has expired');
        throw new NotFoundException('Short URL has expired');
      }

      this.logger.log('Updating last accessed time.');

      shortUrl.lastAccessedAt = new Date();
      await shortUrl.save();

      this.logger.log('Short URL accessed.');

      return shortUrl.originalUrl;
    } catch (error) {
      console.error(error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Error getting original url: ${error.message}`);
    }
  }

  private formatUrlResponse(urlDocument: UrlShortenerDocument): UrlResponseDto {
    const backendUrl = this.configService.get<string>('BACKEND_URL');
    this.logger.log('Formatting URL response for: ' + urlDocument.shortCode);
    return {
      shortCode: urlDocument.shortCode,
      originalUrl: urlDocument.originalUrl,
      shortUrl: `${backendUrl}/s/${urlDocument.shortCode}`,
      tags: urlDocument.tags,
      isActive: urlDocument.isActive,
      lastAccessedAt: urlDocument.lastAccessedAt,
    };
  }

  async getUrlDetails(shortCode: string): Promise<UrlResponseDto> {
    try {
      const shortUrl = await this.urlShortenerModel
        .findOne({ shortCode })
        .exec();

      if (!shortUrl) {
        throw new NotFoundException('Short URL not found');
      }

      return this.formatUrlResponse(shortUrl);
    } catch (error) {
      console.error(error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Error getting url details: ${error.message}`);
    }
  }

  @Cron('0 */2 * * *')
  async deactivateExpiredUrls(): Promise<number> {
    try {
      this.logger.log('Starting deactivation of expired URLs...');

      const result = await this.urlShortenerModel
        .updateMany(
          {
            expiresAt: { $lte: new Date() },
            isActive: true,
          },
          {
            isActive: false,
          },
        )
        .exec();

      this.logger.log(`Deactivated ${result.modifiedCount} expired URLs`);
      return result.modifiedCount;
    } catch (error) {
      this.logger.error('Error deactivating expired URLs:', error);
      throw new Error(`Error deactivating expired urls: ${error.message}`);
    }
  }

  async getUrlsByTags(tags: string[]): Promise<UrlResponseDto[]> {
    try {
      const urls = await this.urlShortenerModel
        .find({
          tags: { $in: tags },
          isActive: true,
        })
        .sort({ createdAt: -1 })
        .exec();

      return urls.map((url) => this.formatUrlResponse(url));
    } catch (error) {
      console.error(error);
      throw new Error(`Error getting urls by tags: ${error.message}`);
    }
  }
}
