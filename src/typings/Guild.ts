import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { BaseControllerResponse } from '.';
import { GuildEntity } from '../model/Guild';
import { MemberEntity } from '../model/Member';

export class CreateGuildInput {
	@ApiProperty()
	@IsNotEmpty()
	name: string;

	@ApiProperty()
	@IsOptional()
	description?: string;
}

export class DeleteGuildInput {
	@ApiProperty()
	@IsNotEmpty()
	id: string;
}

export class EditGuildInput {
	@ApiProperty()
	@IsNotEmpty()
	id: string;

	@ApiProperty()
	@IsOptional()
	@IsNotEmpty()
	name?: string;

	@ApiProperty()
	@IsOptional()
	description?: string;
}

export class CreateGuildResponse extends BaseControllerResponse {
	@ApiProperty({
		description: 'Guild info',
	})
	guild: GuildEntity;

	@ApiProperty({
		description: 'Member info',
	})
	member: MemberEntity;
}

export class DeleteGuildResponse extends BaseControllerResponse {
	@ApiProperty({
		description: 'Guild info',
	})
	guild: GuildEntity;
}

export class EditGuildResponse extends DeleteGuildResponse {}

export class GetGuildInfoResponse extends BaseControllerResponse {
	@ApiProperty({
		nullable: true,
		type: () => GuildEntity,
	})
	guild: GuildEntity | null;
}
