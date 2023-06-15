import { Injectable } from '@nestjs/common';
import { MemberDocument } from '../model/Member';
import { UserService } from '../user/user.service';
import permissions from 'src/configuration/permissions';
import { RoleDocument } from 'src/model/Role';
import { RoleService } from 'src/role/role.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { PermissionType } from 'src/model/Role';

export interface CreateMemberOption {
	isOwner: boolean;
}

@Injectable()
export class MemberService {
	constructor(
		private readonly prismaService : PrismaService,

		private readonly userService   : UserService,
		private readonly roleService: RoleService,
	) {}
	async MemberUtilCreateMember(
		guildId: string | undefined,
		userId: string | undefined,
		options: CreateMemberOption,
	) {
		if (!guildId || !userId) {
			throw new Error('Guild ID/User ID is not provided');
		}

		if (!options.isOwner) options.isOwner = false;
		const user = await this.userService.findUserByID<{ guilds: true }>(userId, {
			guilds: true,
		});
		if (!user) {
			throw new Error('User not found');
		}

		const guild = await this.prismaService.findById(guildId);
		if (!guild) {
			throw new Error('Guild not found');
		}
		const member = await this.prismaService.member.create({
			data: {
				userId: user.id,
				guildId: guild.id,
				Role: {
					connect: {
						id: guild.everyoneRoleId,
					},
				},
				...options,
			},
		});
		const everyoneRole = await this.roleService.findRoleById(
			guild.everyoneRole._id,
		);
		this.roleService.addMember
		await this.userService.UpdateUserGuild(user.id, guild.id);
		return await member.save();
	}
	async findMemberById(id: string) {
		return await this.prismaService.member.findUnique({
			where : {
				id: id,
			},
		});
	}
	async findMemberInGuild(guildId: string) {
		return await this.prismaService.role.findMany({
			where: {
				guildId: guildId,
			},
		});
	}
	async MemberUtilCheckPermission(userId: string, guildId: string) {
		if (!userId || !guildId) {
			throw new Error('User ID/Guild ID is not provided');
		}

		const user = await this.userService.findUserByID(userId);

		if (!user) {
			throw new Error('User not found');
		}

		const guild = await this.prismaService.guild.findUnique({
			where: {
				id : guildId
			}
		});

		if (!guild) {
			throw new Error('Guild not found');
		}

		const member = await this.prismaService.member.create({
			data: {
				userId: user.id,
				guildId: guildId,

			},
		});

		if (!member) {
			throw new Error('Member not found');
		}

		const permissionUtil = new PermissionUtilClass(member.isOwner);

		if (!member.isOwner) {
			for (const role_id in member.Role) {
				if (
					await permissionUtil.addRole(role_id, this.roleService.GetRoleModel())
				) {
					member.Role = member.Role.filter((id) => id._id != role_id);
				}
			}
			await member.save();
		}
		const result = {
			permissions: permissionUtil,
			isOwner: member.isOwner,
		};
		console.log({ result });
		return result;
	}
	async findGuildById(id: string) {
		return await this.guildModel.findById(id);
	}
	async findMemberByUserIdAndGuildId(userId: string, guildId: string) {
		return await this.MemberModel.findOne({
			user: userId,
			guild: guildId,
		});
	}
	async findRoleById(id: string) {
		return this.roleService.findRoleById(id);
	}
	async MemberUtilDeleteMember(
		guildId: string | undefined,
		userId: string | undefined,
		onlyMember = false,
		guildDelete = false,
	) {
		if (!userId) {
			throw new Error('Guild ID/User ID is not provided');
		}
		if (!guildId) {
			throw new Error('Guild ID/User ID is not provided');
		}
		const user = await this.userService.findUserByID(userId);
		if (!user) {
			throw new Error('User not found');
		}
		const member = await this.MemberModel.findOne({
			userId: user.id,
			guildId: guildId,
		});
		if (!member) {
			throw new Error('Member not found');
		}
		if (!onlyMember) {
			await this.guildModel.findByIdAndUpdate(guildId, {
				$pull: {
					members: member._id,
				},
			});
			for (const role of member.Role) {
				await this.roleService.GetRoleModel().findByIdAndUpdate(role._id, {
					$pull: {
						member: member._id,
					},
				});
			}
		}
		await this.userService.DeleteGuildForUser(user.id, guildId);
		if (guildDelete) {
			await member.delete();
		} else {
			member.removed = true;
			await member.save();
		}

		return member;
	}
}

class PermissionUtilClass {
	private permission: Array<keyof typeof permissions>;
	metadata: {
		ViewChannel: {
			Block: string[];
			Allow: string[];
		};
		SendMessage: {
			Block: string[];
			Allow: string[];
		};
	};
	isOwner: boolean;
	constructor(isOwner: boolean) {
		this.isOwner = isOwner;
		if (isOwner) {
			this.permission = Object.keys(permissions) as Array<
				keyof typeof permissions
			>;
		} else {
			this.permission = [];
		}
	}
	async addRole(roleId: string, RoleModel: Model<RoleDocument>) {
		const role = await RoleModel.findById(roleId);
		if (!role) {
			return true;
		}
		const permissions = role.permissions.map((i) => i.name);
		for (const p of role.permissions) {
			if (p.metadata) {
				if (p.metadata.name == 'view_channel') {
					this.metadata.ViewChannel.Block.push(...p.metadata.block_channel);
					this.metadata.ViewChannel.Allow.push(...p.metadata.allow_channel);
				} else if (p.metadata.name == 'send_message') {
					this.metadata.SendMessage.Block.push(...p.metadata.block_channel);
					this.metadata.SendMessage.Allow.push(...p.metadata.allow_channel);
				}
			}
		}
		this.permission.push(...permissions);
		return false;
	}
	canKickMember(another: MemberDocument) {
		another.Role;
		return this.permission.includes('kick_member');
	}
	canEditGuild() {
		return (
			this.permission.includes('admin') ||
			this.permission.includes('server_manager')
		);
	}
	canDeleteGuild() {
		return this.isOwner;
	}
	canCreateChannel() {
		return this.permission.includes('channel_manager');
	}
	canDeleteChannel(channelID: string) {
		return (
			this.permission.includes('channel_manager') &&
			!this.metadata.ViewChannel.Block.includes(channelID)
		);
	}
	canEditChannel(channelID: string) {
		return (
			this.permission.includes('channel_manager') &&
			!this.metadata.ViewChannel.Block.includes(channelID)
		);
	}
}
