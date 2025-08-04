import { PrismaService } from '@/prisma/prisma.service';

export const prismaServiceMock = {
    user: {
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
    },
};

export const prismaServiceProviderMock = {
    provide: PrismaService,
    useValue: prismaServiceMock,
};
