import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { EnvConfig } from '@/core/config/env.config';

interface BrevoEmailResponse {
  messageId: string;
}

@Injectable()
export class EmailService {
  private readonly senderEmail: string;
  private readonly apiKey: string;
  private readonly baseUrl: string;

  private readonly logger = new Logger(EmailService.name);

  constructor(private readonly envConfig: EnvConfig) {
    this.senderEmail = this.envConfig.getEnvVarOrThrow('BREVO_SENDER_EMAIL');
    this.apiKey = this.envConfig.getEnvVarOrThrow('BREVO_API_KEY');

    this.baseUrl = this.envConfig.isDevelopment
      ? 'http://localhost:5173'
      : 'https://ultittt.org';
  }

  async sendVerificationEmail(
    username: string,
    email: string,
    token: string,
  ): Promise<boolean> {
    const emailHtml = this.getStylizedEmailMessage(username, token);

    try {
      const response = await axios.post<BrevoEmailResponse>(
        'https://api.brevo.com/v3/smtp/email',
        {
          sender: { email: this.senderEmail, name: 'ultiTTT' },
          to: [{ email, name: username }],
          subject: 'Confirm your ultiTTT account',
          htmlContent: emailHtml,
        },
        {
          headers: {
            'api-key': this.apiKey,
            'Content-Type': 'application/json',
          },
        },
      );

      this.logger.log(`Email sent: ${response.data.messageId || 'success'}`);
      return true;
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error('Error sending email:', error.message);
      }
      return false;
    }
  }

  private getStylizedEmailMessage(username: string, token: string): string {
    const confirmUrl = `${this.baseUrl}/confirmation?token=${token}`;

    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background: #19181A;">
        <h2 style="color: #F5F2FF; text-align: center;">Welcome, ${username}!</h2>
        <p style="color: #F5F2FF; font-size: 16px;">Thank you for signing up for ultiTTT. Please confirm your email by clicking the button below:</p>
        <div style="text-align: center; margin: 20px 0;">
          <a href="${confirmUrl}" style="display: inline-block; padding: 12px 24px; font-size: 16px; color: #fff; background: #845EF6; text-decoration: none; border-radius: 4px;">Confirm Email</a>
        </div>
        <p style="color: #F5F2FF; font-size: 14px;">Or copy and paste this link into your browser:</p>
        <a href="${confirmUrl}" style="word-break: break-word; color: #845EF6;">${confirmUrl}</a>
        <hr style="border: 0; border-top: 1px solid #2C2B2D; margin: 20px 0;">
        <p style="color: #ACAAB3; font-size: 12px; text-align: center;">This link is going to expire in 24 hours.</p>
        <p style="color: #ACAAB3; font-size: 12px; text-align: center;">If you didn't sign up for ultiTTT, please ignore this email.</p>
      </div>
    `;
  }
}
