import {Member, MemberModel} from '../model/Member'
import {UserModel} from '../model/User'
import {GuildModel} from '../model/Guild'
import path from 'path'
import dotenv from 'dotenv'

import permissions from '../configuration/permissions'
import {RoleModel} from '../model/Role'
import {DocumentType} from '@typegoose/typegoose'

dotenv.config({
	path: path.join(__dirname, '..', '..', '.env'),
})

interface CreateMemberOption {
	isOwner: boolean
}

export const MemberUtil = {
	CreateMember: async (
		guildId: string | undefined,
		userId: string | undefined,
		options: CreateMemberOption
	) => {
		if (!guildId || !userId) {
			throw new Error('Guild ID/User ID is not provided')
		}

		if (!options.isOwner) options.isOwner = false

		const user = await UserModel.findById(userId)
		if (!user) {
			throw new Error('User not found')
		}

		const guild = await GuildModel.findById(guildId)
		if (!guild) {
			throw new Error('Guild not found')
		}
		const member = new MemberModel({
			userId: user._id,
			guildId: guild._id,
			Role: [],
			...options,
		})
		user.update({
			$push: {
				guilds: guildId,
			},
		})
		await member.save()
		return member
	},
	DeleteMember: async (
		guildId: string | undefined,
		userId: string | undefined
	) => {
		if (!userId) {
			throw new Error('Guild ID/User ID is not provided')
		}

		const user = await UserModel.findById(userId)
		if (!user) {
			throw new Error('User not found')
		}

		const member = await MemberModel.findOne({
			userId: user._id,
			guildId: guildId,
		})
		if (!member) {
			throw new Error('Member not found')
		}
		await GuildModel.findByIdAndUpdate(guildId, {
			$pull: {
				members: member._id,
			},
		})
		user.update({
			$pull: {
				guilds: guildId,
			},
		})
		await member.delete()

		return member
	},
	CheckPermissions: async (userId: string | undefined, guildId: string) => {
		if (!userId || !guildId) {
			throw new Error('User ID/Guild ID is not provided')
		}

		const user = await UserModel.findById(userId)

		if (!user) {
			throw new Error('User not found')
		}

		const guild = await GuildModel.findById(guildId)

		if (!guild) {
			throw new Error('Guild not found')
		}

		const member = await MemberModel.findOne({
			userId: user._id,
			guildId: guild._id,
		})

		if (!member) {
			throw new Error('Member not found')
		}

		let permissionUtil = new PermissionUtilClass(member.isOwner)

		if (!member.isOwner) {
			for (let role_id in member.Role) {
				if (await permissionUtil.addRole(role_id)) {
					member.Role = member.Role.filter((id) => id != role_id)
				}
			}
			await member.save()
		}
		const result = {
			permissions: permissionUtil,
			isOwner: member.isOwner,
		}
		console.log({result})
		return result
	},
}

class PermissionUtilClass {
	private permission: Array<keyof typeof permissions>
	metadata: {
		ViewChannel: {
			Block: string[]
			Allow: string[]
		}
		SendMessage: {
			Block: string[]
			Allow: string[]
		}
	}
	isOwner: boolean
	constructor(isOwner: boolean) {
		this.isOwner = isOwner
		if (isOwner) {
			this.permission = Object.keys(permissions) as Array<
				keyof typeof permissions
			>
		} else {
			this.permission = []
		}
	}
	async addRole(roleId: string) {
		let role = await RoleModel.findById(roleId)
		if (!role) {
			return true
		}
		let permissions = role.permissions.map((i) => i.name)
		for (let p of role.permissions) {
			if (p.metadata) {
				if (p.metadata.name == 'view_channel') {
					this.metadata.ViewChannel.Block.push(...p.metadata.block_channel)
					this.metadata.ViewChannel.Allow.push(...p.metadata.allow_channel)
				} else if (p.metadata.name == 'send_message') {
					this.metadata.SendMessage.Block.push(...p.metadata.block_channel)
					this.metadata.SendMessage.Allow.push(...p.metadata.allow_channel)
				}
			}
		}
		this.permission.push(...permissions)
		return false
	}
	canKickMember(another: DocumentType<Member>) {
		another.Role
		return this.permission.includes('kick_member')
	}
	canEditGuild() {
		return (
			this.permission.includes('admin') ||
			this.permission.includes('server_manager')
		)
	}
	canDeleteGuild() {
		return this.isOwner
	}
	canCreateChannel() {
		return this.permission.includes('channel_manager')
	}
	canDeleteChannel(channelID: string) {
		return (
			this.permission.includes('channel_manager') &&
			!this.metadata.ViewChannel.Block.includes(channelID)
		)
	}
	canEditChannel(channelID: string) {
		return (
			this.permission.includes('channel_manager') &&
			!this.metadata.ViewChannel.Block.includes(channelID)
		)
	}
}
