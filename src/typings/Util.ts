import permissions from "../configuration/permissions";

export interface PermissionType {
	name: keyof typeof permissions;
	metadata?: Metadata;
}
export const PermissionClass = class implements PermissionType {
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
