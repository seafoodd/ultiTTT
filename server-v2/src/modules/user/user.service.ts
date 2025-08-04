import {
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { User } from '@prisma/client';

@Injectable()
export class UserService {
    constructor(private readonly prisma: PrismaService) {}

    async create(username: string, email: string, password: string) {
        const existing = await this.prisma.user.findFirst({
            where: {
                OR: [{ email }, { username }],
            },
        });

        if (existing?.email === email) {
            throw new ConflictException('Email is already taken');
        }

        if (existing?.username === username) {
            throw new ConflictException('Username is already taken');
        }

        return this.prisma.user.create({
            data: {
                username,
                displayName: username,
                email,
                password,
                socials: { create: {} },
                perfs: {
                    create: {
                        bullet: { create: {} },
                        blitz: { create: {} },
                        rapid: { create: {} },
                        standard: { create: {} },
                    },
                },
                profile: { create: {} },
            },
        });
    }

    async get(identifier: string) {
        const userByEmail = await this.prisma.user.findUnique({
            where: { email: identifier },
        });
        if (userByEmail) return userByEmail;

        return this.prisma.user.findUnique({ where: { username: identifier } });
    }

    private async _findOrThrow<T>(
        promise: Promise<T | null>,
        message = 'Not found',
    ): Promise<T> {
        const result = await promise;
        if (!result) throw new NotFoundException(message);
        return result;
    }

    async getOrThrow(identifier: string) {
        return this._findOrThrow(this.get(identifier), 'User not found');
    }

    async getByCustomerId(stripeCustomerId: string) {
        return this.prisma.user.findUnique({
            where: { stripeCustomerId },
        });
    }

    async getByCustomerIdOrThrow(stripeCustomerId: string) {
        return this._findOrThrow(this.getByCustomerId(stripeCustomerId), 'User not found');
    }

    async update(identifier: string, data: Partial<User>) {
        const user = await this.getOrThrow(identifier);

        return this.prisma.user.update({
            where: { username: user.username },
            data,
        });
    }
}
