import { Test } from '@nestjs/testing';
import { Provider } from '@nestjs/common';
import {
    emailServiceProviderMock,
    jwtServiceProviderMock,
    prismaServiceProviderMock,
    userServiceProviderMock,
} from '../mocks';

export async function createTestingModuleWithMocks(providers: Provider[] = []) {
    return Test.createTestingModule({
        providers: [
            prismaServiceProviderMock,
            emailServiceProviderMock,
            jwtServiceProviderMock,
            userServiceProviderMock,
            ...providers,
        ],
    }).compile();
}
