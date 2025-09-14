import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Get,
  Put,
  Res,
  UsePipes,
  ValidationPipe,
  Query,
  Logger,
} from '@nestjs/common';
import { UrlShortenerService } from './url-shortener.service';
import { Response } from 'express';
import { CreateUrlDto, UrlResponseDto } from './dto/url-shortener.dto';

@Controller('url-shortener')
export class UrlShortenerController {
  private readonly logger = new Logger(UrlShortenerController.name);
  constructor(private readonly urlShortener: UrlShortenerService) {}

  @Post()
  async shortenUrl(
    @Body() createUrlDto: CreateUrlDto,
  ): Promise<UrlResponseDto> {
    try {
      const result = await this.urlShortener.shortenUrl(createUrlDto);
      return result;
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: error.message,
        },
        HttpStatus.BAD_REQUEST,
        {
          cause: error,
        },
      );
    }
  }

  @Get(':shortCode/details')
  async getUrlDetails(
    @Param('shortCode') shortCode: string,
  ): Promise<UrlResponseDto> {
    try {
      const urlDetails = await this.urlShortener.getUrlDetails(shortCode);
      return urlDetails;
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: error.message,
        },
        HttpStatus.NOT_FOUND,
        {
          cause: error,
        },
      );
    }
  }

  @Get('s/:shortCode')
  async redirectToOriginalUrl(
    @Param('shortCode') shortCode: string,
    @Res() res: Response,
  ) {
    try {
      const originalUrl = await this.urlShortener.getOriginalUrl(shortCode);
      this.logger.log(`Redirecting to original URL: ${originalUrl}`);
      return res.redirect(originalUrl);
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: error.message,
        },
        HttpStatus.NOT_FOUND,
        {
          cause: error,
        },
      );
    }
  }

  @Get('tags/search')
  async getUrlsByTags(
    @Query('tags') tagsQuery: string,
  ): Promise<UrlResponseDto[]> {
    try {
      const tags = tagsQuery.split(',').map((tag) => tag.trim());
      const urls = await this.urlShortener.getUrlsByTags(tags);
      return urls;
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
        {
          cause: error,
        },
      );
    }
  }

  @Post('cleanup/expired')
  async deactivateExpiredUrls(): Promise<{ deactivatedCount: number }> {
    try {
      const deactivatedCount = await this.urlShortener.deactivateExpiredUrls();
      return { deactivatedCount };
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
        {
          cause: error,
        },
      );
    }
  }
}
