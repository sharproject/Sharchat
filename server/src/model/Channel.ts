import {getModelForClass, modelOptions, prop} from '@typegoose/typegoose'
import {User} from './User'

@modelOptions({
	schemaOptions: {
		timestamps: true,
	},
})
export class Channel {
	public _id: string

	@prop({required: true, default: Date.now(), type: () => Date})
	public createdAt: Date

	@prop({required: true, default: Date.now()})
	public updatedAt: Date

	@prop({required: true})
	public name: string

	@prop({required: true})
	public description: string

	@prop({required: true})
	public guild: string

	@prop({required: true, ref: () => User})
	public owner: string
}

export const ChannelModel = getModelForClass(Channel)
