import { Test, TestingModule } from '@nestjs/testing';
import { GuildService } from './guild.service';

describe('GuildService', () => {
    let provider: GuildService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [GuildService],
        }).compile();

        provider = module.get<GuildService>(GuildService);
    });

    it('should be defined', () => {
        expect(provider).toBeDefined();
    });
});
