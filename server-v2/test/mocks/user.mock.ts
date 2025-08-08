import { UserService } from '@/modules/user/user.service';

export const userServiceMock = {
    create: jest.fn(),
    get: jest.fn(),
};

export const userServiceProviderMock = {
    provide: UserService,
    useValue: userServiceMock,
};
