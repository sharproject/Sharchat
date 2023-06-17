import { User } from '@prisma/client';
import { GuildEntity } from './Guild';
import { ApiProperty } from '@nestjs/swagger';

export class UserEntity implements User {
	constructor() {}
	@ApiProperty({
		description: 'Username',
	})
	public username: string;

	@ApiProperty({
		description: 'Raw User password =))',
	})
	public password: string;

	@ApiProperty({
		description: 'User email',
	})
	public email: string;

	public id: string;

	@ApiProperty({
		type: () => Date,
	})
	public createdAt: Date;

	@ApiProperty({
		type: () => Date,
	})
	public updatedAt: Date;

	@ApiProperty({
		description: 'User guild list',
	})
	public guilds?: GuildEntity[];
}
