import { Injectable } from '@nestjs/common';
import { MemberEntity } from '../model/Member';
import { UserService } from '../user/user.service';
import permissions from 'src/configuration/permissions';
import { RoleService } from 'src/role/role.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { PermissionType } from '../typings';

export interface CreateMemberOption {
	isOwner: boolean;
}

@Injectable()
export class MemberService {
	constructor(
		private readonly userService: UserService,
		private readonly prismaService: PrismaService,
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

		const guild = await this.prismaService.guild.findUnique({
			where: {
				id: guildId,
			},
		});
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

		this.roleService.addMemberToRole(guild.everyoneRoleId, member.id);
		await this.prismaService.guild.update({
			where: {
				id: guild.id,
			},
			data: {
				members: {
					connect: {
						id: member.id,
					},
				},
			},
		});
		await this.userService.UpdateUserGuild(user.id, guild.id);
		const returnMember = await this.prismaService.member.findUnique({
			where: {
				id: member.id,
			},
		});
		if (!returnMember) throw new Error('Server Error');
		return returnMember;
	}
	async findMemberById(id: string) {
		return await this.prismaService.member.findUnique({
			where: {
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
	async setRemoved(id: string, removed: boolean) {
		return await this.prismaService.member.update({
			where: {
				id,
			},
			data: {
				removed,
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
				id: guildId,
			},
		});

		if (!guild) {
			throw new Error('Guild not found');
		}

		const member = await this.prismaService.member.findFirst({
			where: {
				userId: user.id,
				guildId: guild.id,
			},
			include: {
				Role: true,
			},
		});

		if (!member) {
			// throw new Error('Member not found');
			return null;
		}

		const permissionUtil = new PermissionUtilClass(member.isOwner);

		if (!member.isOwner) {
			for (const role_id in member.Role) {
				if (
					await permissionUtil.addRole(role_id, this.roleService.GetRoleModel())
				) {
					await this.prismaService.member.update({
						where: {
							id: member.id,
						},
						data: {
							Role: {
								disconnect: {
									id: role_id,
								},
							},
						},
					});
				}
			}
		}
		const result = {
			permissions: permissionUtil,
			isOwner: member.isOwner,
		};
		console.log({ result });
		return result;
	}
	async findGuildById(id: string) {
		return await this.prismaService.guild.findFirst({
			where: {
				id,
			},
		});
	}
	async findMemberByUserIdAndGuildId(userId: string, guildId: string) {
		return await this.prismaService.member.findFirst({
			where: {
				userId,
				guildId,
			},
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
		const member = await this.prismaService.member.findFirst({
			where: {
				userId: user.id,
				guildId: guildId,
			},
			include: {
				Role: true,
			},
		});
		if (!member) {
			throw new Error('Member not found');
		}
		if (!onlyMember) {
			// await this.guildModel.findByIdAndUpdate(guildId, {
			// 	$pull: {
			// 		members: member._id,
			// 	},
			// });
			await this.prismaService.guild.update({
				data: {
					members: {
						disconnect: { id: member.id },
					},
				},
				where: {
					id: guildId,
				},
			});
			for (const role of member.Role) {
				await this.roleService.GetRoleModel().update({
					where: {
						id: role.id,
					},
					data: {
						member: {
							disconnect: {
								id: member.id,
							},
						},
					},
				});
			}
		}
		await this.userService.DeleteGuildForUser(user.id, guildId);
		if (guildDelete) {
			this.prismaService.member.delete({
				where: {
					id: member.id,
				},
			});
		} else {
			// member.removed = true;
			// await member.save();
			await this.prismaService.member.update({
				where: {
					id: member.id,
				},
				data: {
					removed: true,
				},
			});
		}

		return member;
	}
}

export class PermissionUtilClass {
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
	highestPosition: number;
	constructor(isOwner: boolean) {
		this.isOwner = isOwner;
		this.highestPosition = 0;
		if (isOwner) {
			this.permission = Object.keys(permissions) as Array<
				keyof typeof permissions
			>;
		} else {
			this.permission = [];
		}
	}
	async addRole(
		roleId: string,
		RoleModel: Prisma.RoleDelegate<
			Prisma.RejectOnNotFound | Prisma.RejectPerOperation | undefined
		>,
	) {
		const role = await RoleModel.findUnique({
			where: {
				id: roleId,
			},
		});
		if (!role) {
			return true;
		}
		if (this.highestPosition < role.position) {
			this.highestPosition = Number(role.position);
		}
		const rolePermissions = JSON.parse(role.permissions) as PermissionType[];
		const permissions = rolePermissions.map((i) => i.name);
		for (const p of rolePermissions) {
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
	canKickMember(another: MemberEntity) {
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

	couldCreateRole(position: number) {
		return (
			this.permission.includes('role_manager') &&
			this.highestPosition > position
		);
	}
	couldEditRole(position: number) {
		return (
			this.permission.includes('role_manager') &&
			this.highestPosition > position
		);
	}
	couldDeleteRole(position: number) {
		return (
			this.permission.includes('role_manager') &&
			this.highestPosition > position
		);
	}
	couldAddOrRemoveRoleForMember(position: number) {
		return (
			this.permission.includes('role_manager') &&
			this.highestPosition > position
		);
	}
}
