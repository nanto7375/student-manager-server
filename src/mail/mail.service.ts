import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;
  private readonly recipient: string;

  constructor(private readonly config: ConfigService) {
    this.recipient = this.config.get('SM_ALERT_MAIL_TO');
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.config.get('SM_GMAIL_USER'),
        pass: this.config.get('SM_GMAIL_APP_PASSWORD'),
      },
    });
  }

  async sendErrorAlert({ subject, body }: { subject: string; body: string }) {
    try {
      await this.transporter.sendMail({
        from: this.config.get('SM_GMAIL_USER'),
        to: this.recipient,
        subject: `[SM Server Error] ${subject}`,
        text: body,
      });
    } catch (e) {
      console.error('Failed to send error alert email:', e);
    }
  }
}
