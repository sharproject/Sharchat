import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Role } from './Role';
import { Guild } from './Guild';
import { User } from './User';

export type MemberDocument = HydratedDocument<Member>;
@Schema({
    timestamps: true,
})
export class Member {
    constructor() {}
    public _id: string;

    @Prop({ isRequired: true, default: Date.now(), type: Date })
    public joinedAt: Date;

    @Prop({ isRequired: true, default: Date.now(), type: Date })
    public updatedAt: Date;

    @Prop({
        isRequired: true,
        type: mongoose.Types.ObjectId,
        ref: 'User',
    })
    public user: User;

    @Prop({
        isRequired: true,
        type: mongoose.Types.ObjectId,
        ref: 'Guild',
    })
    public guild: Guild;

    @Prop({
        isRequired: true,
        default: [],
        type: [{ type: mongoose.Types.ObjectId, ref: 'Role' }],
    })
    public Role: Array<Role>;

    @Prop({ default: false, isRequired: true })
    public isOwner: boolean;
}

export const MemberSchema = SchemaFactory.createForClass(Member);
MemberSchema.plugin(require('mongoose-autopopulate'));
export const MemberModel = mongoose.model(Member.name, MemberSchema);
