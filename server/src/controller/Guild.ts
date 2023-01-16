import {GuildModel} from '../model/Guild'
import {MemberModel} from '../model/Member'
import {Controller, ControllerType} from '../helper/ControllerType'
import {MemberUtil} from '../util/Member'
import {AuthMiddleware} from '../middleware/auth'
import {RoleModel} from '../model/Role'
import {everyonePermissionDefault} from '../configuration/permissions'

export const CreateGuild: ControllerType<true> = async (req, res) => {
	const {name} = req.body
	if (!name) {
		res.status(400).json({
			message: 'Missing required fields',
		})
		return
	}
	const description = req.body.description && ''

	try {
		const guild = await new GuildModel({
			name,
			description,
			owner: res.locals.userId,
		}).save()

		const member = await MemberUtil.CreateMember(guild._id, res.locals.userId, {
			isOwner: true,
		})

		const EveryOneRole = await new RoleModel({
			RoleName: '@everyone',
			guild: guild._id,
			permissions: everyonePermissionDefault,
			position: 1,
		}).save()
		guild.everyoneRole = EveryOneRole._id
		guild.role.push(EveryOneRole._id)
		member.Role.push(EveryOneRole._id)
		guild.members.push(member._id)
		EveryOneRole.member.push(member._id)

		await member.save()
		await EveryOneRole.save()
		await guild.save()

		res.status(201).json({
			message: 'Guild created',
			guild,
			member,
		})
	} catch (error) {
		console.log(error)
		res.status(500).json({
			message: 'Error creating guild',
		})
	}
}
CreateGuild.ControllerName = 'create'
CreateGuild.RequestMethod = 'post'
CreateGuild.RequestBody = {
	name: 'string',
	description: {type: 'string', optional: true},
}

export const DeleteGuild: ControllerType<true> = async (req, res) => {
	const {id} = req.body
	if (!id) {
		res.status(400).json({
			message: 'Missing required fields',
		})
		return
	}

	try {
		const guild = await GuildModel.findById(id)
		if (!guild) {
			res.status(400).json({
				message: 'Guild not found',
			})
			return
		}
		const result = await MemberUtil.CheckPermissions(
			res.locals.userId,
			guild._id
		)
		if (!result.isOwner) {
			res.status(403).json({
				message: 'Requested user is not the guild owner',
			})
			return
		}

		try {
			const members = await MemberModel.find({
				guildId: guild._id,
			})
			//TODO: send event to client
			members.map((d) => d.delete())
		} catch (err) {
			console.log(err)
		}

		await guild.delete()

		res.status(200).json({
			message: 'Guild deleted',
			guild,
		})
	} catch (error) {
		console.log(error)
		res.status(500).json({
			message: 'Error deleting guild',
		})
	}
}
DeleteGuild.ControllerName = 'delete'
DeleteGuild.RequestMethod = 'delete'
DeleteGuild.RequestBody = {
	id: 'string',
}

export const EditGuild: ControllerType<true> = async (req, res) => {
	const {id, name, description} = req.body
	if (!id) {
		res.status(400).json({
			message: 'Missing required fields',
		})
		return
	}

	try {
		const guild = await GuildModel.findById(id)
		if (!guild) {
			res.status(400).json({
				message: 'Guild not found',
			})
			return
		}
		const result = await MemberUtil.CheckPermissions(
			res.locals.userId,
			guild._id
		)
		if (!result.isOwner && !result.permissions.canEditGuild()) {
			res.status(403).json({
				message: "Requested member doesn't have permission to edit",
			})
			return
		}

		if (
			(name && typeof name == 'string') ||
			(description && typeof description == 'string')
		) {
			if (name && typeof name == 'string') guild.name = name
			if (description && typeof description == 'string')
				guild.description = description

			await guild.save()
		}

		res.status(200).json({
			message: 'Guild edited',
			guild,
		})
	} catch (error) {
		console.log(error)
		res.status(500).json({
			message: 'Error editing guild',
		})
	}
}
EditGuild.ControllerName = 'edit'
EditGuild.RequestMethod = 'patch'
EditGuild.RequestBody = {
	id: 'string',
	name: {
		type: 'string',
		optional: true,
	},
	description: {
		type: 'string',
		optional: true,
	},
}

export const GetGuild: ControllerType = async (req, res) => {
	return res.json(await GuildModel.findById(req.params.guildId))
}
GetGuild.ControllerName = '/info'
GetGuild.RequestMethod = 'get'
GetGuild.RequestQuery = {
	guildId: 'string',
}

export const GuildController = new Controller(
	[CreateGuild, DeleteGuild, EditGuild, GetGuild],
	'/guild'
).SetMiddleware([AuthMiddleware])
