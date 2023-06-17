import { MessageEntity } from './Message';
import { GuildEntity } from './Guild';
import { ApiProperty } from '@nestjs/swagger';
import { Channel } from '@prisma/client';

export class ChannelEntity implements Channel {
	constructor() {}

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
		type: () => GuildEntity,
	})
	public guild?: GuildEntity;

	@ApiProperty({
		type: () => [MessageEntity],
	})
	public message?: MessageEntity[];
}
