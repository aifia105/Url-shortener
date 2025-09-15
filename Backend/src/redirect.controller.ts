import {
  Controller,
  Get,
  Param,
  Res,
  Logger,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { UrlShortenerService } from './url-shortener/url-shortener.service';
import { Response } from 'express';

@Controller()
export class RedirectController {
  private readonly logger = new Logger(RedirectController.name);

  constructor(private readonly urlShortenerService: UrlShortenerService) {}

  @Get('s/:shortCode')
  async redirectToOriginalUrl(
    @Param('shortCode') shortCode: string,
    @Res() res: Response,
  ) {
    try {
      const originalUrl =
        await this.urlShortenerService.getOriginalUrl(shortCode);
      this.logger.log(`Redirecting to original URL: ${originalUrl}`);
      return res.redirect(originalUrl);
    } catch (error) {
      this.logger.error(
        `Error redirecting for short code ${shortCode}: ${error.message}`,
      );
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
}
