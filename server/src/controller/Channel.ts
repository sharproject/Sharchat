import {Controller, ControllerType} from '../helper/ControllerType'
import {AuthMiddleware} from '../middleware/auth'
import {ChannelModel} from '../model/Channel'
import {MemberModel} from '../model/Member'
import {MemberUtil} from '../util/Member'

export const CreateChannel: ControllerType<true> = async (req, res, _next) => {
	try {
		const {name, guildId} = req.body
		const description = req.body.description || ''
		const userId = res.locals.userId
		if (!userId) {
			res.status(400).json({
				message: 'UnAuthorization',
			})
		}
		const member = await MemberModel.findOne({
			guildId,
			userId,
		})
		if (!member) {
			res.status(400).json({
				message: 'user not in guild',
			})
			return
		}
		const permission = await MemberUtil.CheckPermissions(
			member.userId,
			member.guildId
		)
		if (!permission.permissions.canCreateChannel()) {
			res.status(403).send({
				message: 'Missing permissions',
			})
			return
		}
		const channel = await new ChannelModel({
			name,
			description,
			guild: guildId,
		}).save()
		res.status(200).json({
			message: 'Channel created',
			channel,
		})
	} catch (error) {
		res.status(500).json({
			message: 'Internal Server Error',
		})
		return
	}
}
CreateChannel.ControllerName = 'create'
CreateChannel.RequestMethod = 'post'
CreateChannel.RequestBody = {
	name: 'string',
	description: {type: 'string', optional: true},
	guildId: 'string',
}

export const DeleteChannel: ControllerType<true> = async (req, res, _next) => {
	try {
		const {guildId, channelId} = req.body
		const userId = res.locals.userId
		if (!userId) {
			res.status(400).json({
				message: 'UnAuthorization',
			})
		}
		if (!channelId) {
			res.status(500).json({
				message: 'Internal Server Error',
			})
			return
		}
		const member = await MemberModel.findOne({
			guildId,
			userId,
		})
		if (!member) {
			res.status(400).json({
				message: 'user not in guild',
			})
			return
		}
		const permission = await MemberUtil.CheckPermissions(
			member.userId,
			member.guildId
		)
		if (!permission.permissions.canDeleteChannel(channelId)) {
			res.status(403).send({
				message: 'Missing permissions',
			})
			return
		}
		const channel = await ChannelModel.findOneAndDelete({
			guild: guildId,
			_id: channelId,
		})
		res.status(200).json({
			message: 'Channel created',
			channel,
		})
	} catch (error) {
		res.status(500).json({
			message: 'Internal Server Error',
		})
		return
	}
}
DeleteChannel.ControllerName = 'delete'
DeleteChannel.RequestMethod = 'delete'
DeleteChannel.RequestBody = {
	guildId: 'string',
	channelId: 'string',
}

export const EditChannel: ControllerType<true> = async (req, res, _next) => {
	try {
		const {guildId, channelId} = req.body

		const userId = res.locals.userId
		if (!userId) {
			res.status(400).json({
				message: 'UnAuthorization',
			})
		}
		const member = await MemberModel.findOne({
			guildId,
			userId,
		})
		if (!member) {
			res.status(400).json({
				message: 'user not in guild',
			})
			return
		}
		const permission = await MemberUtil.CheckPermissions(
			member.userId,
			member.guildId
		)
		if (!permission.permissions.canEditChannel(channelId)) {
			res.status(403).send({
				message: 'Missing permissions',
			})
			return
		}
		let channel = await ChannelModel.findOne({
			guild: guildId,
			_id: channelId,
		})
		if (!channel) {
			res.status(400).json({
				message: 'Channel not found',
			})
			return
		}
		const description = req.body.description || channel.description
		const name = req.body.name || channel.name
		channel = await ChannelModel.findOneAndUpdate(
			{
				guild: guildId,
				_id: channelId,
			},
			{
				description,
				name,
			},
			{
				new: true,
			}
		)
		res.status(200).json({
			message: 'Channel Edited',
			channel,
		})
	} catch (error) {
		res.status(500).json({
			message: 'Internal Server Error',
		})
		return
	}
}
EditChannel.ControllerName = 'edit'
EditChannel.RequestMethod = 'post'
EditChannel.RequestBody = {
	name: {type: 'string', optional: true},
	description: {type: 'string', optional: true},
	guildId: 'string',
	channelId: 'string',
}

export const EditChannelPermission: ControllerType<true> = async (
	req,
	res
) => {}
EditChannelPermission.ControllerName = 'edit/permission'
EditChannelPermission.RequestMethod = 'post'
EditChannelPermission.RequestBody = {
	channelId: 'string',
	guildId: 'string',
	permission: {
		type: 'array',
		childType: {
			type: 'object',
			childType: {
				name: 'string',
				block: 'boolean',
				allow: 'boolean',
			},
		},
	},
	userId: 'string',
}

export const ChannelController = new Controller(
	[CreateChannel, DeleteChannel, EditChannel],
	'/channel'
).SetMiddleware([AuthMiddleware])
