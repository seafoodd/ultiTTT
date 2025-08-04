import { JwtService } from '@nestjs/jwt';

export const jwtServiceMock = {
    sign: jest.fn(),
    verify: jest.fn(),
};

export const jwtServiceProviderMock = {
    provide: JwtService,
    useValue: jwtServiceMock,
};
