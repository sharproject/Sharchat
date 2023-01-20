import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { User } from './User';
import { Channel } from './Channel';
import { Member } from './Member';

export type MessageDocument = HydratedDocument<Message>;
@Schema({
    timestamps: true,
})
export class Message {
    constructor() {}
    public _id: string;

    @Prop({ isRequired: true, default: Date.now() })
    public createdAt: Date;

    @Prop({ isRequired: true, default: Date.now() })
    public updatedAt: Date;

    @Prop({
        isRequired: true,
        type: mongoose.Types.ObjectId,
        ref: 'User',
    })
    public User: User;

    @Prop({
        isRequired: true,
        type: mongoose.Types.ObjectId,
        ref: 'Channel',
    })
    public Channel: Channel;

    //   @Prop({ isRequired: false })
    //   public threadId?: string;

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
export const MessageModel = mongoose.model(Message.name, MessageSchema);
