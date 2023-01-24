import { Test, TestingModule } from '@nestjs/testing';
import { RoleNotAuthController } from './role.not_auth.controller';

describe('RoleNotAuthController', () => {
	let controller: RoleNotAuthController;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [RoleNotAuthController],
		}).compile();

		controller = module.get<RoleNotAuthController>(RoleNotAuthController);
	});

	it('should be defined', () => {
		expect(controller).toBeDefined();
	});
});
