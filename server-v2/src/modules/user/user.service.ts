import {
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class UserService {
    constructor(private prisma: PrismaService) {}

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

    async getOrThrow(identifier: string) {
        const user = await this.get(identifier);
        if (!user) throw new NotFoundException('User not found');
        return user;
    }
}
