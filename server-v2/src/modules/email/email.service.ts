import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { EnvConfig } from '@/core/config/env.config';
import * as path from 'path';
import * as fs from 'fs';
import validator from 'validator';

interface BrevoEmailResponse {
    messageId: string;
}

@Injectable()
export class EmailService {
    private _disposableDomains: Set<string>;
    private readonly _senderEmail: string;
    private readonly _brevoApiKey: string;
    private readonly _rapidApiKey: string;
    private readonly _baseUrl: string;

    private readonly _logger = new Logger(EmailService.name);

    constructor(private readonly envConfig: EnvConfig) {
        this._senderEmail =
            this.envConfig.getEnvVarOrThrow('BREVO_SENDER_EMAIL');
        this._brevoApiKey = this.envConfig.getEnvVarOrThrow('BREVO_API_KEY');
        this._rapidApiKey = this.envConfig.getEnvVarOrThrow('RAPIDAPI_KEY');

        this._baseUrl = this.envConfig.isDevelopment
            ? 'http://localhost:5173'
            : envConfig.getEnvVarOrThrow('DOMAIN_URL');

        const filePath = path.join(
            process.cwd(),
            'data',
            'disposable-domains.txt',
        );
        const content = fs.readFileSync(filePath, 'utf-8');

        this._disposableDomains = new Set(
            content
                .split('\n')
                .map((d) => d.trim().toLowerCase())
                .filter(Boolean),
        );
    }

    private async _rapidApiCheck(emailDomain: string): Promise<boolean> {
        const options = {
            method: 'GET',
            url: 'https://mailcheck.p.rapidapi.com/',
            params: {
                domain: emailDomain,
            },
            headers: {
                'x-rapidapi-key': this._rapidApiKey,
                'x-rapidapi-host': 'mailcheck.p.rapidapi.com',
            },
        };

        const response = await axios.request(options);

        const { disposable, valid } = response.data ?? {};

        if (typeof disposable !== 'boolean' || typeof valid !== 'boolean') {
            throw new Error('Unexpected API response structure');
        }

        return !disposable && valid;
    }

    async isEmailValid(email: string): Promise<boolean> {
        if (!validator.isEmail(email)) {
            return false;
        }

        if (this.envConfig.isDevelopment) {
            return true; // do not check in development
        }

        const domain = email.split('@')[1]?.toLowerCase() ?? '';

        let isValid = true;

        isValid &&= await this._rapidApiCheck(domain);
        isValid &&= !this._disposableDomains.has(domain);

        return isValid;
    }

    async sendVerificationEmail(
        username: string,
        email: string,
        token: string,
    ): Promise<void> {
        const emailHtml = this._getStylizedEmailMessage(username, token);

        const url = 'https://api.brevo.com/v3/smtp/email';
        const data = {
            sender: { email: this._senderEmail, name: 'ultiTTT' },
            to: [{ email, name: username }],
            subject: 'Confirm your ultiTTT account',
            htmlContent: emailHtml,
        };
        const config = {
            headers: {
                'api-key': this._brevoApiKey,
                'Content-Type': 'application/json',
            },
        };

        const response = await axios.post<BrevoEmailResponse>(
            url,
            data,
            config,
        );

        this._logger.log(`Email sent: ${response.data.messageId || 'success'}`);
    }

    private _getStylizedEmailMessage(username: string, token: string): string {
        const confirmUrl = `${this._baseUrl}/confirmation?token=${token}`;

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
