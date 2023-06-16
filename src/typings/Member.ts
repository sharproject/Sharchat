import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { GuildEntity } from '../model/Guild';
import { MemberEntity } from '../model/Member';
import { BaseControllerResponse } from '.';

export class JoinGuildInput {
	@ApiProperty()
	@IsNotEmpty()
	id: string;
}
export class LeaveGuildInput {
	@ApiProperty()
	@IsNotEmpty()
	id: string;
}

export class JoinGuildResponse extends BaseControllerResponse {
	@ApiProperty({
		description:
			'user was join guild before (true if user join and then leave)',
	})
	Joined: boolean;
	@ApiProperty()
	guild: GuildEntity;
	@ApiProperty()
	member: MemberEntity;
}

export class LeaveGuildResponse extends BaseControllerResponse {
	@ApiProperty()
	guild: GuildEntity;
	@ApiProperty()
	member: MemberEntity;
}

export class GetMemberResponse extends BaseControllerResponse {
	@ApiProperty({
		// type: () => Member,
		nullable: true,
	})
	member: MemberEntity | null;
}
