import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type UrlShortenerDocument = UrlShortener & Document;

@Schema({ timestamps: true })
export class UrlShortener {
  @Prop({ required: true, validate: /^https?:\/\/.+/ })
  originalUrl: string;

  @Prop({ required: true, unique: true, index: true })
  shortCode: string;

  @Prop({ type: Date, default: null })
  expiresAt: Date;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ type: String, default: null })
  userId: string;

  @Prop({ type: String, default: null })
  customAlias: string;

  @Prop({ type: Date, default: null })
  lastAccessedAt: Date;
}

export const UrlShortenerSchema = SchemaFactory.createForClass(UrlShortener);
