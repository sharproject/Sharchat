import { Test, TestingModule } from '@nestjs/testing';
import { AuthenticationService } from './authentication.service';

describe('AuthService', () => {
    let provider: AuthenticationService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [AuthenticationService],
        }).compile();

        provider = module.get<AuthenticationService>(AuthenticationService);
    });

    it('should be defined', () => {
        expect(provider).toBeDefined();
    });
});
