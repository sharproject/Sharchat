import { UserEntity } from './User';
import { MemberEntity } from './Member';
import { ChannelEntity } from './Channel';
import { RoleEntity } from './Role';
import { ApiProperty } from '@nestjs/swagger';
import { Guild } from '@prisma/client';

export class GuildEntity implements Guild {
	@ApiProperty()
	ownerID: string;
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

	@ApiProperty()
	public name: string;

	@ApiProperty()
	public description: string;

	@ApiProperty({
		type: () => UserEntity,
	})
	public owner?: UserEntity;

	@ApiProperty({
		type: () => [MemberEntity],
	})
	public members?: MemberEntity[];

	@ApiProperty({
		type: () => [ChannelEntity],
	})
	public channels?: ChannelEntity[];

	@ApiProperty()
	public everyoneRoleId: string;

	@ApiProperty({
		type: () => [RoleEntity],
	})
	public role?: RoleEntity[];
}
