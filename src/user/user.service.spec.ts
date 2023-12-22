import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from '../prisma/prisma.service';

describe('UserService', () => {
	let provider: UserService;

	const mockPrisma = {
		user: {
			findFirst: async ({
				where: { email },
			}: {
				where: { email: string };
			}): Promise<
				| ({
						guilds: {
							id: string;
							createdAt: Date;
							updatedAt: Date;
							name: string;
							description: string;
							everyoneRoleId: string;
							ownerID: string;
						}[];
				  } & {
						id: string;
						username: string;
						password: string;
						email: string;
						createdAt: Date;
						updatedAt: Date;
				  })
				| null
			> => {
				if (email === 'test@example.com') {
					return {
						guilds: [],
						id: 'test',
						username: 'test',
						password: 'test',
						email: 'test@example.com',
						createdAt: new Date(),
						updatedAt: new Date(),
					};
				}
				return null;
			},
		},
	};
	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [UserService, PrismaService],
		})
			.overrideProvider(PrismaService)
			.useValue(mockPrisma)
			.compile();

		provider = module.get<UserService>(UserService);
	});

	it('should be defined', () => {
		expect(provider).toBeDefined();
	});
	describe('findUserByEmail', () => {
		it('should return a user object with guilds included when the provided email exists in the database', async () => {
			const email = 'test@example.com';

			const user = await provider.findUserByEmail(email);

			expect(user?.email).toEqual(email);
			expect(user).toHaveProperty('guilds');
		});

		it('should return null when the provided email does not exist in the database', async () => {
			const email = 'nonexistent@example.com';

			const user = await provider.findUserByEmail(email);

			expect(user).toBeNull();
		});

		// Add more test cases as needed
	});

	// Add more test cases as needed
});
