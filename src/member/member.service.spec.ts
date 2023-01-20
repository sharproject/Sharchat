import { Test, TestingModule } from '@nestjs/testing';
import { MemberService } from './member.service';

describe('MemberService', () => {
    let provider: MemberService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [MemberService],
        }).compile();

        provider = module.get<MemberService>(MemberService);
    });

    it('should be defined', () => {
        expect(provider).toBeDefined();
    });
});
