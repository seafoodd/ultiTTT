jest.mock('nanoid', () => ({
    nanoid: jest.fn(() => 'mocked-id'),
}));

jest.mock('bcrypt', () => ({
    hash: jest.fn(() => Promise.resolve('hashedpassword')),
}));

import * as bcrypt from 'bcrypt';
import { createTestingModuleWithMocks } from '../../../test/utils/testing.module';
import { AuthService } from '@/modules/auth/auth.service';
import {
    emailServiceMock,
    jwtServiceMock,
    userServiceMock,
} from '../../../test/mocks';

describe('AuthService', () => {
    let authService: AuthService;

    beforeEach(async () => {
        const moduleRef = await createTestingModuleWithMocks([AuthService]);
        authService = moduleRef.get(AuthService);

        jest.clearAllMocks();
    });

    describe('register', () => {
        it('should register user successfully', async () => {
            emailServiceMock.isEmailValid.mockResolvedValue(true);
            userServiceMock.create.mockResolvedValue({
                username: 'testuser',
                email: 'test@example.com',
            });
            jwtServiceMock.sign.mockReturnValue('jsonwebtoken');
            emailServiceMock.sendVerificationEmail.mockResolvedValue(undefined);

            await authService.register({
                email: 'test@example.com',
                username: 'testuser',
                password: 'password123',
            });

            expect(emailServiceMock.isEmailValid).toHaveBeenCalledWith('test@example.com');
            expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
            expect(userServiceMock.create).toHaveBeenCalledWith(
                'testuser',
                'test@example.com',
                'hashedpassword',
            );
            expect(jwtServiceMock.sign).toHaveBeenCalledWith(
                { email: 'test@example.com', t: 'verify-email' },
                { expiresIn: '24h' },
            );
            expect(emailServiceMock.sendVerificationEmail).toHaveBeenCalledWith(
                'testuser',
                'test@example.com',
                'jsonwebtoken',
            );
        });

        it('should throw BadRequestException if email invalid', async () => {
            emailServiceMock.isEmailValid.mockResolvedValue(false);

            await expect(
                authService.register({
                    email: 'bademail',
                    username: 'testuser',
                    password: 'password123',
                }),
            ).rejects.toThrow('Invalid email');

            expect(userServiceMock.create).not.toHaveBeenCalled();
        });
    });
});
