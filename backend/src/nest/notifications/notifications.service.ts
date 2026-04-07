import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as sgMail from '@sendgrid/mail';
import { Notification } from './notification.entity';
import { User } from '../users/user.entity';

@Injectable()
export class NotificationsService {
  private readonly emailEnabled: boolean;
  private readonly fromEmail: string;

  constructor(
    @InjectRepository(Notification)
    private readonly notificationsRepository: Repository<Notification>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    configService: ConfigService,
  ) {
    const apiKey = configService.get<string>('SENDGRID_API_KEY');
    this.fromEmail = configService.get<string>('SENDGRID_FROM_EMAIL', 'no-reply@equix.local');
    this.emailEnabled = Boolean(apiKey);

    if (apiKey) {
      sgMail.setApiKey(apiKey);
    }
  }

  async createNotification(userId: string, message: string): Promise<Notification> {
    const notification = await this.notificationsRepository.save(
      this.notificationsRepository.create({
        userId,
        message,
        readStatus: false,
      }),
    );

    await this.sendEmailIfPossible(userId, message);
    return notification;
  }

  async listForUser(userId: string): Promise<Notification[]> {
    return this.notificationsRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async markRead(notificationId: string, userId: string): Promise<Notification> {
    const notification = await this.notificationsRepository.findOne({
      where: { id: notificationId, userId },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    notification.readStatus = true;
    return this.notificationsRepository.save(notification);
  }

  private async sendEmailIfPossible(userId: string, message: string): Promise<void> {
    if (!this.emailEnabled) {
      return;
    }

    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user?.email) {
      return;
    }

    try {
      await sgMail.send({
        to: user.email,
        from: this.fromEmail,
        subject: 'EquiX Notification',
        text: message,
      });
    } catch {
      // Keep in-app notifications reliable even if email provider fails.
    }
  }
}
