import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Deal } from './deal.entity';
import { CreateDealDto } from './dto/create-deal.dto';
import { UsersService } from '../users/users.service';
import { Role } from '../common/enums/role.enum';
import { PropertiesService } from '../properties/properties.service';
import { DealStatus } from './enums/deal-status.enum';

@Injectable()
export class DealsService {
  constructor(
    @InjectRepository(Deal)
    private readonly dealsRepository: Repository<Deal>,
    private readonly usersService: UsersService,
    private readonly propertiesService: PropertiesService,
  ) {}

  async create(dto: CreateDealDto): Promise<Deal> {
    await this.propertiesService.getById(dto.propertyId);

    const [buyer, seller, agent, conveyancer] = await Promise.all([
      this.usersService.getById(dto.buyerId),
      this.usersService.getById(dto.sellerId),
      this.usersService.getById(dto.agentId),
      this.usersService.getById(dto.conveyancerId),
    ]);

    if (buyer.role !== Role.BUYER) {
      throw new BadRequestException('buyerId must reference a Buyer user');
    }
    if (seller.role !== Role.SELLER) {
      throw new BadRequestException('sellerId must reference a Seller user');
    }
    if (agent.role !== Role.AGENT) {
      throw new BadRequestException('agentId must reference an Agent user');
    }
    if (conveyancer.role !== Role.CONVEYANCER) {
      throw new BadRequestException('conveyancerId must reference a Conveyancer user');
    }

    const deal = this.dealsRepository.create({
      propertyId: dto.propertyId,
      buyerId: dto.buyerId,
      sellerId: dto.sellerId,
      agentId: dto.agentId,
      conveyancerId: dto.conveyancerId,
      status: dto.status ?? DealStatus.DRAFT,
    });

    return this.dealsRepository.save(deal);
  }

  async getAll(): Promise<Deal[]> {
    return this.dealsRepository.find({
      relations: {
        property: true,
        buyer: true,
        seller: true,
        agent: true,
        conveyancer: true,
      },
      order: { createdAt: 'DESC' },
    });
  }

  async getById(id: string): Promise<Deal> {
    const deal = await this.dealsRepository.findOne({
      where: { id },
      relations: {
        property: true,
        buyer: true,
        seller: true,
        agent: true,
        conveyancer: true,
      },
    });

    if (!deal) {
      throw new NotFoundException('Deal not found');
    }

    return deal;
  }
}
