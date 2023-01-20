import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { User } from './User';
import { Member } from './Member';
import { Channel } from './Channel';
import { Role } from './Role';

export type GuildDocument = HydratedDocument<Guild>;
@Schema({
    timestamps: true,
})
export class Guild {
    public _id: string;

    @Prop({ isRequired: true, default: Date.now(), type: Date })
    public createdAt: Date;

    @Prop({ isRequired: true, default: Date.now(), type: Date })
    public updatedAt: Date;

    @Prop({ isRequired: true })
    public name: string;

    @Prop({ isRequired: true })
    public description: string;

    @Prop({
        isRequired: true,
        type: mongoose.Types.ObjectId,
        ref: 'User',
    })
    public owner: User;

    @Prop({
        isRequired: true,
        default: [],
        type: [{ type: mongoose.Types.ObjectId, ref: 'Member' }],
    })
    public members: Member[];

    @Prop({
        isRequired: true,
        default: [],
        type: [{ type: mongoose.Types.ObjectId, ref: 'Channel' }],
    })
    public channels: Channel[];

    @Prop({
        isRequired: true,
        default: '',
        type: mongoose.Types.ObjectId,
        ref: 'Role',
    })
    public everyoneRole: Role;

    @Prop({
        isRequired: true,
        default: [],
        type: [{ type: mongoose.Types.ObjectId, ref: 'Role' }],
    })
    public role: Role[];
}

export const GuildSchema = SchemaFactory.createForClass(Guild);
GuildSchema.plugin(require('mongoose-autopopulate'));
export const GuildModel = mongoose.model(Guild.name, GuildSchema);
