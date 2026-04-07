import { Body, Controller, Get, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { PropertiesService } from './properties.service';
import { CreatePropertyDto } from './dto/create-property.dto';

@Controller('properties')
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  @Post()
  async create(@Body() dto: CreatePropertyDto) {
    return this.propertiesService.create(dto);
  }

  @Get(':id')
  async getById(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.propertiesService.getById(id);
  }
}
