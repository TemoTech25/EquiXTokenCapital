import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Property } from './property.entity';
import { CreatePropertyDto } from './dto/create-property.dto';

@Injectable()
export class PropertiesService {
  constructor(
    @InjectRepository(Property)
    private readonly propertiesRepository: Repository<Property>,
  ) {}

  async create(dto: CreatePropertyDto): Promise<Property> {
    const property = this.propertiesRepository.create({
      title: dto.title,
      location: dto.location,
      valuation: dto.valuation.toFixed(2),
    });

    return this.propertiesRepository.save(property);
  }

  async getById(id: string): Promise<Property> {
    const property = await this.propertiesRepository.findOne({ where: { id } });

    if (!property) {
      throw new NotFoundException('Property not found');
    }

    return property;
  }
}
