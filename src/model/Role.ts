import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import permissions from '../configuration/permissions';
import { Guild } from './Guild';
import { Member } from './Member';
import { ApiProperty } from '@nestjs/swagger';

export type RoleDocument = HydratedDocument<Role>;
@Schema({
	timestamps: true,
})
export class Role {
	static push: any;
	constructor() {}

	@ApiProperty()
	@Prop({ isRequired: true, type: String })
	public RoleName: string;

	@ApiProperty()
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
		type: () => Guild,
	})
	@Prop({
		isRequired: true,
		type: mongoose.Types.ObjectId,
		ref: 'Guild',
	})
	public guild: Guild;

	@ApiProperty({
		type: () => [PermissionClass],
	})
	@Prop({
		isRequired: true,
		default: [],
	})
	public permissions: Array<PermissionType>;

	@ApiProperty()
	@Prop({ isRequired: true, default: false })
	public hide: boolean;

	@ApiProperty()
	@Prop({ isRequired: true, default: 1 })
	public position: number;

	@ApiProperty({
		type: () => [Member],
	})
	@Prop({
		isRequired: true,
		default: [],
		type: [{ type: mongoose.Types.ObjectId, ref: 'Member' }],
	})
	member: Member[];

	@ApiProperty()
	@Prop({ isRequired: true, default: '#fffff' })
	public color: string;

	@ApiProperty()
	@Prop({ isRequired: true, default: false })
	public hideInNav: boolean;
}

export const RoleSchema = SchemaFactory.createForClass(Role);
RoleSchema.plugin(require('mongoose-autopopulate'));

export interface PermissionType {
	name: keyof typeof permissions;
	metadata?: Metadata;
}
const PermissionClass = class implements PermissionType {
	name: keyof typeof permissions;
	metadata?: Metadata | undefined;
};

interface BaseMetaData {
	name: keyof typeof permissions;
}

interface MetaDataForChannelView extends BaseMetaData {
	name: 'view_channel';
	allow_channel: string | 'all'[];
	block_channel: string | 'all'[];
}

interface MetaDataForChannelSendMessage extends BaseMetaData {
	name: 'send_message';
	allow_channel: string | 'all'[];
	block_channel: string | 'all'[];
}

type Metadata = MetaDataForChannelSendMessage | MetaDataForChannelView;
