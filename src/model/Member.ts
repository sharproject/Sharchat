import { RoleEntity } from './Role';
import { GuildEntity } from './Guild';
import { UserEntity } from './User';
import { ApiProperty } from '@nestjs/swagger';
import { Member } from '@prisma/client';

export class MemberEntity implements Member {
	public id: string;

	@ApiProperty({
		type: () => Date,
	})
	public joinedAt: Date;

	@ApiProperty()
	guildId: string;
	@ApiProperty()
	userId: string;

	@ApiProperty({
		type: () => Date,
	})
	public updatedAt: Date;

	@ApiProperty({
		type: () => UserEntity,
	})
	public user?: UserEntity;

	@ApiProperty({
		type: () => GuildEntity,
	})
	public guild?: GuildEntity;

	@ApiProperty({
		type: () => [RoleEntity],
	})
	public Role?: Array<RoleEntity>;

	@ApiProperty()
	public isOwner: boolean;

	@ApiProperty()
	removed: boolean;
}
