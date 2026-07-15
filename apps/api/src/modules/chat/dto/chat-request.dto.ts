import { IsString, IsArray, IsOptional } from 'class-validator';

export class ChatRequestDto {
  @IsString()
  conversationId!: string;

  @IsString()
  message!: string;

  @IsArray()
  @IsOptional()
  history?: unknown[];
}
