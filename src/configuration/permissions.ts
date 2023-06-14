import { PermissionType } from 'src/typings';

const permissions = {
	admin: 'Server Administrator',
	server_manager: 'Server Manager',
	moderator: 'Server Moderator',
	kick_member: 'Kick Member',
	view_channel: 'View Channel',
	send_message: 'Send Message To Channel',
	channel_manager: 'Channel Manager',
};

export const everyonePermissionDefault: Array<PermissionType> = [
	{
		name: 'send_message',
		metadata: {
			name: 'send_message',
			allow_channel: ['all'],
			block_channel: [],
		},
	},
	{
		name: 'view_channel',
		metadata: {
			name: 'view_channel',
			allow_channel: ['all'],
			block_channel: [],
		},
	},
];

export default permissions;
