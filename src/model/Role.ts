import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import permissions from '../configuration/permissions';
import { Guild } from './Guild';
import { Member } from './Member';

export type RoleDocument = HydratedDocument<Role>;
@Schema({
    timestamps: true,
})
export class Role {
    constructor() {}
    @Prop({ isRequired: true, type: String })
    public RoleName: string;

    public _id: string;

    @Prop({ isRequired: true, default: Date.now() })
    public createdAt: Date;

    @Prop({ isRequired: true, default: Date.now() })
    public updatedAt: Date;

    @Prop({
        isRequired: true,
        type: mongoose.Types.ObjectId,
        ref: 'Guild',
    })
    public guild: Guild;

    @Prop({
        isRequired: true,
        default: [],
    })
    public permissions: Array<PermissionType>;

    @Prop({ isRequired: true, default: false })
    public hide: boolean;

    @Prop({ isRequired: true, default: 1 })
    public position: number;

    @Prop({
        isRequired: true,
        default: [],
        type: [{ type: mongoose.Types.ObjectId, ref: 'Member' }],
    })
    member: Member[];
}

export const RoleSchema = SchemaFactory.createForClass(Role);
RoleSchema.plugin(require('mongoose-autopopulate'));
export const RoleModel = mongoose.model(Role.name, RoleSchema);

export interface PermissionType {
    name: keyof typeof permissions;
    metadata?: Metadata;
}
let PermissionClass = class implements PermissionType {
    name: keyof typeof permissions;
    metadata?: Metadata | undefined;
};

interface BaseMetaData {
    name: keyof typeof permissions;
}

interface MetaDataForChannelView extends BaseMetaData {
    name: 'view_channel';
    allow_channel: string | 'all'[];
    block_channel: string | 'all'[];
}

interface MetaDataForChannelSendMessage extends BaseMetaData {
    name: 'send_message';
    allow_channel: string | 'all'[];
    block_channel: string | 'all'[];
}

type Metadata = MetaDataForChannelSendMessage | MetaDataForChannelView;
