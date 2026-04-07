import { Body, Controller, Get, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { AiService } from './ai.service';
import { ParseDocumentDto } from './dto/parse-document.dto';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('parse-document')
  async parseDocument(@Body() dto: ParseDocumentDto) {
    return this.aiService.parseDocument(dto.text);
  }

  @Get('suggestions/:deal_id')
  async suggestions(@Param('deal_id', new ParseUUIDPipe()) dealId: string) {
    return this.aiService.suggestions(dealId);
  }
}
