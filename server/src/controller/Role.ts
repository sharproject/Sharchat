import {
	Controller,
	ControllerType,
} from '../helper/ControllerType'
import {AuthMiddleware} from '../middleware/auth'

//NOTE: can not create , edit or delete the @everyone
export const CreateRole: ControllerType<true> = async (_req, _res, _next) => {}
CreateRole.ControllerName = 'create'
CreateRole.RequestMethod = 'post'
CreateRole.RequestBody = {
	guildId: 'string',
	users: {
		type: 'array',
		childType: 'string',
	},
	permission: {
		type: 'array',
		childType: {
			type: 'object',
			childType: {
				name: 'string',
				// metadata: 'object',
			},
		},
	},
}

export const RoleController = new Controller(
	[CreateRole],
	'/role'
).SetMiddleware([AuthMiddleware])
