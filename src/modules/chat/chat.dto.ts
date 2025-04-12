import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';

export enum LLM_MODEL {
  OPENAI = 'OPENAI',
  CLAUDE = 'CLAUDE',
}


export class MessageDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  vaultId?: string;

  @ApiProperty()
  @IsOptional()
  @IsEnum(LLM_MODEL)
  llmModel?: LLM_MODEL;
}