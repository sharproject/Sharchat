import {
	Controller,
	ControllerType,
	TControllerMiddlewareFn,
} from '../helper/ControllerType'
import {AuthMiddleware} from '../middleware/auth'

export const CreateChannel: ControllerType<true> = async (
	_req,
	_res,
	_next
) => {}
CreateChannel.ControllerName = 'create'
CreateChannel.RequestMethod = 'get'
CreateChannel.RequestBody = {
	name: 'string',
	description: {type: 'string', optional: true},
	guildId: 'string',
}

export const ChannelController = new Controller(
	[CreateChannel],
	'/channel'
).SetMiddleware([AuthMiddleware])
