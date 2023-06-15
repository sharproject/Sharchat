import { GuildEntity } from './Guild';
import { MemberEntity } from './Member';
import { ApiProperty } from '@nestjs/swagger';
import { PermissionClass, PermissionType } from '../typings';
import { Role } from '@prisma/client';

export class RoleEntity implements Role {
	constructor() {}

	guildId: string;

	@ApiProperty()
	public RoleName: string;

	@ApiProperty()
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
		type: () => GuildEntity,
	})
	public guild: GuildEntity;

	@ApiProperty({
		// type: () => [PermissionClass],
	})
	// public permissions: Array<PermissionType>;
	permissions: string;

	@ApiProperty()
	public hide: boolean;

	@ApiProperty()
	public position: number;

	@ApiProperty({
		type: () => [MemberEntity],
	})
	member: MemberEntity[];

	@ApiProperty()
	public color: string;

	@ApiProperty()
	public hideInNav: boolean;
}
