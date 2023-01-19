import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Guild } from './Guild';

export type UserDocument = HydratedDocument<User>;

@Schema({
    timestamps: true,
})
export class User {
    constructor() {}
    @Prop({ isRequired: true })
    public username: string;

    @Prop({ isRequired: true })
    public password: string;

    @Prop({ isRequired: true })
    public email: string;

    public _id: string;

    @Prop({ isRequired: true, default: Date.now() })
    public createdAt: Date;

    @Prop({ isRequired: true, default: Date.now() })
    public updatedAt: Date;

    @Prop({
        isRequired: true,
        default: [],
        type: [{ type: mongoose.Types.ObjectId, ref: 'Guild' }],
    })
    public guilds: Guild[];
}

export const UserSchema = SchemaFactory.createForClass(User);
export const UserModel = mongoose.model(User.name, UserSchema);
