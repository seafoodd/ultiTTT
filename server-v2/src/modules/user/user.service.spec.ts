import { ConflictException, NotFoundException } from '@nestjs/common';
import { UserService } from './user.service';
import { createTestingModuleWithMocks } from '../../../test/utils/testing.module';
import { prismaServiceMock } from '../../../test/mocks';

describe('UserService', () => {
    let userService: UserService;

    beforeEach(async () => {
        const moduleRef = await createTestingModuleWithMocks([UserService]);
        userService = moduleRef.get(UserService);
        jest.clearAllMocks();
    });

    describe('create', () => {
        it('should create a user when no conflicts', async () => {
            prismaServiceMock.user.findFirst.mockResolvedValue(null);
            prismaServiceMock.user.create.mockResolvedValue({ email: "test@example.com", username: 'test' });

            const result = await userService.create('test', 'test@example.com', 'pass123');

            expect(prismaServiceMock.user.findFirst).toHaveBeenCalledWith({
                where: { OR: [{ email: 'test@example.com' }, { username: 'test' }] },
            });
            expect(prismaServiceMock.user.create).toHaveBeenCalled();
            expect(result.username).toBe('test');
        });

        it('should throw ConflictException if email already taken', async () => {
            prismaServiceMock.user.findFirst.mockResolvedValue({ email: 'test@example.com' });

            await expect(
                userService.create('newuser', 'test@example.com', 'pass123'),
            ).rejects.toThrow(ConflictException);

            expect(prismaServiceMock.user.create).not.toHaveBeenCalled();
        });

        it('should throw ConflictException if username already taken', async () => {
            prismaServiceMock.user.findFirst.mockResolvedValue({ username: 'testuser' });

            await expect(
                userService.create('testuser', 'new@example.com', 'pass123'),
            ).rejects.toThrow(ConflictException);

            expect(prismaServiceMock.user.create).not.toHaveBeenCalled();
        });
    });

    describe('get', () => {
        it('should return user by email if found', async () => {
            prismaServiceMock.user.findUnique
                .mockResolvedValueOnce({ id: 1, email: 'email@test.com' });

            const user = await userService.get('email@test.com');
            expect(user).not.toBeNull();
            expect(prismaServiceMock.user.findUnique).toHaveBeenCalledWith({
                where: { email: 'email@test.com' },
            });
            expect(user!.email).toBe('email@test.com');
        });

        it('should return user by username if email not found', async () => {
            prismaServiceMock.user.findUnique
                .mockResolvedValueOnce(null)
                .mockResolvedValueOnce({ id: 2, username: 'username' });

            const user = await userService.get('username');
            expect(user).not.toBeNull();
            expect(prismaServiceMock.user.findUnique).toHaveBeenNthCalledWith(1, {
                where: { email: 'username' },
            });
            expect(prismaServiceMock.user.findUnique).toHaveBeenNthCalledWith(2, {
                where: { username: 'username' },
            });
            expect(user!.username).toBe('username');
        });
    });

    describe('getOrThrow', () => {
        it('should return user if found', async () => {
            prismaServiceMock.user.findUnique
                .mockResolvedValueOnce({ id: 1, email: 'email@test.com' });

            const user = await userService.getOrThrow('email@test.com');

            expect(user.email).toBe('email@test.com');
        });

        it('should throw NotFoundException if user not found', async () => {
            prismaServiceMock.user.findUnique.mockResolvedValue(null);

            await expect(userService.getOrThrow('unknown')).rejects.toThrow(NotFoundException);
        });
    });

    describe('getByCustomerId', () => {
        it('should return user by stripeCustomerId', async () => {
            prismaServiceMock.user.findUnique.mockResolvedValue({ id: 5, stripeCustomerId: 'cus_123' });

            const user = await userService.getByCustomerId('cus_123');
            expect(user).not.toBeNull();
            expect(prismaServiceMock.user.findUnique).toHaveBeenCalledWith({
                where: { stripeCustomerId: 'cus_123' },
            });
            expect(user!.stripeCustomerId).toBe('cus_123');
        });
    });

    describe('getByCustomerIdOrThrow', () => {
        it('should return user if found', async () => {
            prismaServiceMock.user.findUnique.mockResolvedValue({ id: 5, stripeCustomerId: 'cus_123' });

            const user = await userService.getByCustomerIdOrThrow('cus_123');

            expect(user.stripeCustomerId).toBe('cus_123');
        });

        it('should throw NotFoundException if user not found', async () => {
            prismaServiceMock.user.findUnique.mockResolvedValue(null);

            await expect(userService.getByCustomerIdOrThrow('cus_unknown')).rejects.toThrow(
                NotFoundException,
            );
        });
    });

    describe('update', () => {
        it('should update user data', async () => {
            const existingUser = { email: 'oldemail@test.com', username: 'testuser' };
            const updateData = { email: 'newemail@test.com' };

            prismaServiceMock.user.findUnique.mockResolvedValue(existingUser);
            prismaServiceMock.user.update.mockResolvedValue({ ...existingUser, ...updateData });

            const result = await userService.update('testuser', updateData);

            expect(prismaServiceMock.user.findUnique).toHaveBeenCalledWith({
                where: { email: 'testuser' },
            });
            expect(prismaServiceMock.user.update).toHaveBeenCalledWith({
                where: { username: existingUser.username },
                data: updateData,
            });
            expect(result.email).toBe('newemail@test.com');
        });

        it('should throw NotFoundException if user to update not found', async () => {
            prismaServiceMock.user.findUnique.mockResolvedValue(null);

            await expect(userService.update('missinguser', { email: 'x@y.com' })).rejects.toThrow(
                NotFoundException,
            );
        });
    });
});
