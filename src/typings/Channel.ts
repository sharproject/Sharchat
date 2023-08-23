import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { BaseControllerResponse } from '.';
import { ChannelEntity } from 'src/model/Channel';

export class CreateChannelInput {
	@ApiProperty()
	@IsNotEmpty()
	name: string;

	@ApiProperty()
	@IsNotEmpty()
	guildID: string;

	@ApiProperty()
	@IsOptional()
	description?: string;
}

export class DeleteChannelInput {
	@ApiProperty()
	@IsNotEmpty()
	id: string;
}

export class EditChannelInput {
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

export class CreateChannelResponse extends BaseControllerResponse {
	@ApiProperty({
		description: 'Channel info',
	})
	channel: ChannelEntity;
}

export class DeleteChannelResponse extends BaseControllerResponse {
	@ApiProperty({
		description: 'Channel info',
	})
	channel: ChannelEntity;
}

export class EditChannelResponse extends DeleteChannelResponse {}
