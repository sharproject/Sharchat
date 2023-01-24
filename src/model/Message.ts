import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { User } from './User';
import { Channel } from './Channel';
import { Member } from './Member';
import { ApiProperty } from '@nestjs/swagger';

export type MessageDocument = HydratedDocument<Message>;
@Schema({
    timestamps: true,
})
export class Message {
    constructor() {}
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
        type: () => User,
    })
    @Prop({
        isRequired: true,
        type: mongoose.Types.ObjectId,
        ref: 'User',
    })
    public User: User;

    @ApiProperty({
        type: () => Channel,
    })
    @Prop({
        isRequired: true,
        type: mongoose.Types.ObjectId,
        ref: 'Channel',
    })
    public Channel: Channel;

    //   @Prop({ isRequired: false })
    //   public threadId?: string;

    @ApiProperty({
        type: () => Member,
    })
    @Prop({
        type: mongoose.Types.ObjectId,
        ref: 'Member',
        isRequired: true,
        default: '',
    })
    public member: Member;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
MessageSchema.plugin(require('mongoose-autopopulate'));
