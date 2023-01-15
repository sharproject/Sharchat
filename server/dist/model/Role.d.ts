import permissions from '../configuration/permissions';
export declare class Role {
    RoleName: string;
    _id: string;
    createdAt: Date;
    updatedAt: Date;
    guild: string;
    permissions: Array<{
        name: keyof typeof permissions;
        metadata?: Metadata;
    }>;
}
export declare const RoleModel: import("@typegoose/typegoose").ReturnModelType<typeof Role, import("@typegoose/typegoose/lib/types").BeAnObject>;
interface BaseMetaData {
    name: keyof typeof permissions;
}
interface MetaDataForChannelView extends BaseMetaData {
    name: 'view_channel';
    allow_channel: string[];
    block_channel: string[];
}
interface MetaDataForChannelSendMessage extends BaseMetaData {
    name: 'send_message';
    allow_channel: string[];
    block_channel: string[];
}
declare type Metadata = MetaDataForChannelSendMessage | MetaDataForChannelView;
export {};
