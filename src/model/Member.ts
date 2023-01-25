import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Role } from './Role';
import { Guild } from './Guild';
import { User } from './User';
import { ApiProperty } from '@nestjs/swagger';

export type MemberDocument = HydratedDocument<Member>;
@Schema({
    timestamps: true,
})
export class Member {
    constructor() {}
    public _id: string;

    @ApiProperty({
        type: () => Date,
    })
    @Prop({ isRequired: true, default: Date.now(), type: Date })
    public joinedAt: Date;

    @ApiProperty({
        type: () => Date,
    })
    @Prop({ isRequired: true, default: Date.now(), type: Date })
    public updatedAt: Date;

    @ApiProperty({
        type: () => User,
    })
    @Prop({
        isRequired: true,
        type: mongoose.Types.ObjectId,
        ref: 'User',
    })
    public user: User;

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
        type: () => [Role],
    })
    @Prop({
        isRequired: true,
        default: [],
        type: [{ type: mongoose.Types.ObjectId, ref: 'Role' }],
    })
    public Role: Array<Role>;

    @ApiProperty()
    @Prop({ default: false, isRequired: true })
    public isOwner: boolean;

    @ApiProperty()
    @Prop({default:false , isRequired: true})
    removed:boolean
}

export const MemberSchema = SchemaFactory.createForClass(Member);
MemberSchema.plugin(require('mongoose-autopopulate'));
