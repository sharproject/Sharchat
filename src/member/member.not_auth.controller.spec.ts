import { Test, TestingModule } from '@nestjs/testing';
import { MemberNotAuthController } from './member.not_auth.controller';

describe('MemberNotAuthController', () => {
	let controller: MemberNotAuthController;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [MemberNotAuthController],
		}).compile();

		controller = module.get<MemberNotAuthController>(
			MemberNotAuthController,
		);
	});

	it('should be defined', () => {
		expect(controller).toBeDefined();
	});
});
