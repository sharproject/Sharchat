import { UserEntity } from './User';
import { ChannelEntity } from './Channel';
import { MemberEntity } from './Member';
import { ApiProperty } from '@nestjs/swagger';
import { Message } from '@prisma/client';

export class MessageEntity implements Message {
	@ApiProperty()
	userId: string;
	@ApiProperty()
	channelId: string;
	@ApiProperty()
	memberId: string;
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
		type: () => UserEntity,
	})
	public User: UserEntity;

	@ApiProperty({
		type: () => ChannelEntity,
	})
	public Channel: ChannelEntity;

	//   @Prop({ isRequired: false })
	//   public threadId?: string;

	@ApiProperty({
		type: () => MemberEntity,
	})
	public member: MemberEntity;
}
