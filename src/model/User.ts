import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Guild } from './Guild';
import { ApiProperty } from '@nestjs/swagger';

export type UserDocument = HydratedDocument<User>;

@Schema({
	timestamps: true,
})
export class User {
	constructor() {}
	@ApiProperty({
		description: 'Username',
	})
	@Prop({ isRequired: true })
	public username: string;

	@ApiProperty({
		description: 'Raw User password =))',
	})
	@Prop({ isRequired: true })
	public password: string;

	@ApiProperty({
		description: 'User email',
	})
	@Prop({ isRequired: true })
	public email: string;

	public _id: string;

	@ApiProperty({
		type: () => Date,
	})
	@Prop({ isRequired: true, default: Date.now() })
	public createdAt: Date;

	@ApiProperty({
		type: () => Date,
	})
	@Prop({ isRequired: true, default: Date.now() })
	public updatedAt: Date;

	@ApiProperty({
		description: 'User guild list',
	})
	@Prop({
		isRequired: true,
		default: [],
		type: [{ type: mongoose.Types.ObjectId, ref: 'Guild' }],
	})
	public guilds: Guild[];
}

export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.plugin(require('mongoose-autopopulate'));
