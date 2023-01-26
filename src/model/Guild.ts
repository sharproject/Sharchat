import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { User } from './User';
import { Member } from './Member';
import { Channel } from './Channel';
import { Role } from './Role';
import { ApiProperty } from '@nestjs/swagger';

export type GuildDocument = HydratedDocument<Guild>;
@Schema({
	timestamps: true,
})
export class Guild {
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

	@ApiProperty()
	@Prop({ isRequired: true })
	public name: string;

	@ApiProperty()
	@Prop({ isRequired: true })
	public description: string;

	@ApiProperty({
		type: () => User,
	})
	@Prop({
		isRequired: true,
		type: mongoose.Types.ObjectId,
		ref: 'User',
	})
	public owner: User;

	@ApiProperty({
		type: () => [Member],
	})
	@Prop({
		isRequired: true,
		default: [],
		type: [{ type: mongoose.Types.ObjectId, ref: 'Member' }],
	})
	public members: Member[];

	@ApiProperty({
		type: () => [Channel],
	})
	@Prop({
		isRequired: true,
		default: [],
		type: [{ type: mongoose.Types.ObjectId, ref: 'Channel' }],
	})
	public channels: Channel[];

	@ApiProperty({
		type: () => Role,
	})
	@Prop({
		isRequired: true,
		default: '',
		type: mongoose.Types.ObjectId,
		ref: 'Role',
	})
	public everyoneRole: Role;

	@ApiProperty({
		type: () => [Role],
	})
	@Prop({
		isRequired: true,
		default: [],
		type: [{ type: mongoose.Types.ObjectId, ref: 'Role' }],
	})
	public role: Role[];
}

export const GuildSchema = SchemaFactory.createForClass(Guild);
GuildSchema.plugin(require('mongoose-autopopulate'));
