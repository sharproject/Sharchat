import {Request} from 'express'
import {MemberUtil} from '../util/Member'
import {MemberModel} from '../model/Member'
import {GuildModel} from '../model/Guild'
import {Response} from '../typings/ResponseInput'
import {Controller, ControllerType} from '../helper/ControllerType'
import {AuthMiddleware} from '../middleware/auth'
import {RoleModel} from '../model/Role'

export const JoinGuild: ControllerType<true> = async (
	req: Request,
	res: Response<true>
) => {
	const id = req.body.id
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

		let member = await MemberModel.findOne({
			userId: res.locals.userId,
			guildId: guild._id,
		})

		if (member) {
			res.status(200).send({
				message: 'Requested user already joined the guild',
			})
			return
		}
		const everyoneRole = await RoleModel.findById(guild.everyoneRole)
		if (!everyoneRole) {
			res.status(500).json({
				message: 'Server Error',
			})
			return
		}
		member = await MemberUtil.CreateMember(guild._id, res.locals.userId, {
			isOwner: false,
		})
		member.Role.push(everyoneRole?._id)
		await member.save()
		everyoneRole.member.push(member._id)
		guild.members.push(member._id)
		await guild.save()

		res.status(201).send({
			message: 'Joined guild',
			guild,
			member,
		})
	} catch (error) {
		console.log(error)
		res.status(500).json({
			message: 'Error joining guild',
		})
	}
}

JoinGuild.ControllerName = 'join'
JoinGuild.RequestMethod = 'post'
JoinGuild.RequestBody = {
	id: 'string',
}

export const LeaveGuild: ControllerType<true> = async (
	req: Request,
	res: Response<true>
) => {
	const id = req.body.id
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

		let member = await MemberModel.findOne({
			userId: res.locals.userId,
			guildId: guild._id,
		})

		if (!member) {
			res.status(200).send({
				message: "Requested user isn't in the guild",
			})
			return
		}

		if (member.userId == guild.owner) {
			res.status(403).send({
				message: "Guild owner can't leave guild, transfer or delete it instead",
			})
			return
		}

		member = await MemberUtil.DeleteMember(guild._id, res.locals.userId)

		guild.update({
			$pull: {
				members: member._id,
			},
		})
		await guild.save()

		res.status(200).send({
			message: 'Left guild',
			guild,
			member,
		})
	} catch (error) {
		console.log(error)
		res.status(500).json({
			message: 'Error leaving guild',
		})
	}
}
;(LeaveGuild.ControllerName = 'leave'),
	(LeaveGuild.RequestMethod = 'delete'),
	(LeaveGuild.RequestBody = {
		id: 'string',
	})

export const RemoveMember: ControllerType<true> = async (
	req: Request,
	res: Response<true>
) => {
	const userId = req.body.userId
	const guildId = req.body.guildId
	if (!userId || !guildId) {
		res.status(400).json({
			message: 'Missing required fields',
		})
		return
	}

	try {
		const guild = await GuildModel.findById(guildId)
		if (!guild) {
			res.status(400).json({
				message: 'Guild not found',
			})
			return
		}

		const requested = await MemberModel.findOne({
			userId: res.locals.userId,
			guildId: guild._id,
		})

		if (!requested) {
			res.status(403).send({
				message: "Requested user isn't in the guild",
			})
			return
		}

		let permissions = await MemberUtil.CheckPermissions(
			requested.userId,
			requested.guildId
		)
		let member = await MemberModel.findOne({
			userId: userId,
			guildId: guild._id,
		})
		if (!member) {
			res.status(403).send({
				message: "Can't find valid user with the provided ID in the guild",
			})
			return
		}
		if (requested.isOwner && guild.owner == requested.userId) {
			res.status(403).send({
				message: "Guild owner can't leave guild, transfer or delete it instead",
			})
			return
		}
		if (!permissions.permissions.canKickMember(member)) {
			res.status(403).send({
				message: 'Missing permissions',
			})
			return
		}

		// TODO:Check role is hight
		// if (
		// 	permissions.permissions.find((v) => v == 'admin' || v == 'moderator') ||
		// 	member.isOwner ||
		// 	member.userId == guild.owner
		// ) {
		// 	res.status(403).send({
		// 		message:
		// 			"You can't remove this member from the guild. They are Admin, Moderator or Server Owner",
		// 	})
		// 	return
		// }

		member = await MemberUtil.DeleteMember(guild._id, userId)

		const newGuildMembers = guild.members.filter((m) => m !== userId)
		guild.members = newGuildMembers
		await guild.save()

		res.status(200).send({
			message: 'Removed member from the guild',
			guild,
			member,
		})
	} catch (error) {
		console.log(error)
		res.status(500).json({
			message: 'Error leaving guild',
		})
	}
}
;(RemoveMember.ControllerName = 'kick'),
	(RemoveMember.RequestMethod = 'delete'),
	(RemoveMember.RequestBody = {
		userId: 'string',
		guildId: 'string',
	})

export const GetMemberInfo: ControllerType = async (req, res) => {
	return res.json(
		MemberModel.findOne({
			guildId: req.params.guildId,
			userId: req.params.userId,
		})
	)
}
GetMemberInfo.ControllerName = 'info'
GetMemberInfo.RequestMethod = 'get'
GetMemberInfo.RequestQuery = {
	guildId: 'string',
	userId: 'string',
}
GetMemberInfo.BlockOtherMiddleware = true

export const MemberController = new Controller(
	[JoinGuild, LeaveGuild, RemoveMember, GetMemberInfo],
	'/member'
).SetMiddleware([AuthMiddleware])
