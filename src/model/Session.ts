import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type SessionDocument = HydratedDocument<Session>;
@Schema({
    timestamps: true,
    expireAfterSeconds: 60 * 60 * 24,
})
export class Session {
    constructor() {}
    public _id: string;

    @Prop({
        isRequired: true,
        default: Date.now(),
    })
    public createdAt: Date;

    @Prop({ isRequired: true, default: Date.now() })
    public updatedAt: Date;

    @Prop({ isRequired: true })
    UserId: string;
}

export const SessionSchema = SchemaFactory.createForClass(Session);
export const SessionModel = mongoose.model(Session.name, SessionSchema);
