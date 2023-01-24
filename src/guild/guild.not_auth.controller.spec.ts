import { Test, TestingModule } from '@nestjs/testing';
import { GuildNotAuthController } from './guild.not_auth.controller';

describe('GuildNotAuthController', () => {
	let controller: GuildNotAuthController;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [GuildNotAuthController],
		}).compile();

		controller = module.get<GuildNotAuthController>(GuildNotAuthController);
	});

	it('should be defined', () => {
		expect(controller).toBeDefined();
	});
});
