import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { KycService } from './kyc.service';
import { UploadKycDto } from './dto/upload-kyc.dto';
import { VerifyKycDto } from './dto/verify-kyc.dto';

@Controller('kyc')
export class KycController {
  constructor(private readonly kycService: KycService) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: {
        fileSize: 10 * 1024 * 1024,
      },
    }),
  )
  async upload(@Body() dto: UploadKycDto, @UploadedFile() file: Express.Multer.File) {
    return this.kycService.upload(dto, file);
  }

  @Get('status/:user_id')
  async status(@Param('user_id', new ParseUUIDPipe()) userId: string) {
    return this.kycService.status(userId);
  }

  @Patch('verify')
  async verify(@Body() dto: VerifyKycDto) {
    return this.kycService.verify(dto);
  }
}
