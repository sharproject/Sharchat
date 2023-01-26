import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Message } from './Message';
import { Guild } from './Guild';
import { ApiProperty } from '@nestjs/swagger';
export type ChannelDocument = HydratedDocument<Channel>;
@Schema({
	timestamps: true,
})
export class Channel {
	constructor() {}

	@ApiProperty()
	public _id: string;

	@ApiProperty({
		type: () => Date,
	})
	@Prop({ isRequired: true, default: Date.now(), type: Date })
	public createdAt: Date;

	@ApiProperty({
		type: () => Date,
	})
	@Prop({ isRequired: true, default: Date.now(), type: Date })
	public updatedAt: Date;

	@Prop({ isRequired: true })
	@ApiProperty()
	public name: string;

	@Prop({ isRequired: true, default: '' })
	@ApiProperty()
	public description: string;

	@ApiProperty({
		type: () => Guild,
	})
	@Prop({
		isRequired: true,
		type: mongoose.Types.ObjectId,
		ref: 'Guild',
	})
	public guild: Guild;

	@ApiProperty({
		type: () => [Message],
	})
	@Prop({
		type: [{ type: mongoose.Types.ObjectId, ref: 'Message' }],
	})
	public message: Message[];
}

export const ChannelSchema = SchemaFactory.createForClass(Channel);
ChannelSchema.plugin(require('mongoose-autopopulate'));
