// src/modules/telegram/dto/link-telegram.dto.ts
import { IsString, IsNotEmpty } from 'class-validator';

export class LinkTelegramDto {
  @IsString()
  @IsNotEmpty({ message: 'Chat ID is required' })
  chatId!: string;
}