import {getModelForClass, modelOptions, prop} from '@typegoose/typegoose'
import {Role} from './Role'

@modelOptions({
	schemaOptions: {
		timestamps: true,
	},
})
export class Member {
	public _id: string

	@prop({required: true, default: Date.now(), type: () => Date})
	public joinedAt: Date

	@prop({required: true, default: Date.now()})
	public updatedAt: Date

	@prop({required: true})
	public userId: string

	@prop({required: true})
	public guildId: string

	@prop({required: true, default: [], ref: () => Role})
	public Role: Array<string>

	@prop({default: false})
	public isOwner: boolean
}

export const MemberModel = getModelForClass(Member)
