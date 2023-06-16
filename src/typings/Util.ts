import { ApiProperty } from '@nestjs/swagger';
import permissions from '../configuration/permissions';
import { IsString, } from 'class-validator';


export class PermissionType {
	@ApiProperty()
	@IsString()
	name: keyof typeof permissions;
	@ApiProperty()
	metadata?: Metadata | undefined;
}

class BaseMetaData {
	name: keyof typeof permissions;
}

class MetaDataForChannelView extends BaseMetaData {
	name: 'view_channel';
	allow_channel: string | 'all'[];
	block_channel: string | 'all'[];
}

class MetaDataForChannelSendMessage extends BaseMetaData {
	name: 'send_message';
	allow_channel: string | 'all'[];
	block_channel: string | 'all'[];
}

type Metadata = MetaDataForChannelSendMessage | MetaDataForChannelView;
