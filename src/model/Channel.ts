import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Message } from './Message';
import { Guild } from './Guild';
export type ChannelDocument = HydratedDocument<Channel>;
@Schema({
    timestamps: true,
})
export class Channel {
    constructor() {}
    public _id: string;

    @Prop({ isRequired: true, default: Date.now(), type: Date })
    public createdAt: Date;

    @Prop({ isRequired: true, default: Date.now(), type: Date })
    public updatedAt: Date;

    @Prop({ isRequired: true })
    public name: string;

    @Prop({ isRequired: true, default: '' })
    public description: string;

    @Prop({
        isRequired: true,
        type: mongoose.Types.ObjectId,
        ref: 'Guild',
    })
    public guild: Guild;

    @Prop({
        type: [{ type: mongoose.Types.ObjectId, ref: 'Message' }],
    })
    public message: Message[];
}

export const ChannelSchema = SchemaFactory.createForClass(Channel);
ChannelSchema.plugin(require('mongoose-autopopulate'));
export const ChannelModel = mongoose.model(Channel.name, ChannelSchema);
