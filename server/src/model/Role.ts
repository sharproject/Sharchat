import {getModelForClass, modelOptions, prop} from '@typegoose/typegoose'
import permissions from '../configuration/permissions'

@modelOptions({
	schemaOptions: {
		timestamps: true,
	},
})
export class Role {
	@prop({required: true, type: () => String})
	public RoleName: string

	public _id: string

	@prop({required: true, default: Date.now()})
	public createdAt: Date

	@prop({required: true, default: Date.now()})
	public updatedAt: Date

	@prop({required: true})
	public guild: string

	@prop({required: true, default: []})
	public permissions: Array<{
		name: keyof typeof permissions
		metadata?: Metadata
	}>
}

export const RoleModel = getModelForClass(Role)

interface BaseMetaData {
	name: keyof typeof permissions
}

interface MetaDataForChannelView extends BaseMetaData {
	name: 'view_channel'
	allow_channel: string[]
	block_channel: string[]
}

interface MetaDataForChannelSendMessage extends BaseMetaData {
	name: 'send_message'
	allow_channel: string[]
	block_channel: string[]
}

type Metadata = MetaDataForChannelSendMessage | MetaDataForChannelView
