import { EmailService } from '@/modules/email/email.service';

export const emailServiceMock = {
    isEmailValid: jest.fn(),
    sendVerificationEmail: jest.fn(),
};

export const emailServiceProviderMock = {
    provide: EmailService,
    useValue: emailServiceMock,
};
