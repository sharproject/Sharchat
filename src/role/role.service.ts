import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PermissionType } from '../typings';
import { MemberService } from '../member/member.service';

@Injectable()
export class RoleService {
	constructor(
		private readonly prismaService: PrismaService,
		private readonly memberService: MemberService,
	) {}
	async CreateEveryoneRoleForGuild(input: {
		RoleName: string;
		guildId: string;
		permissions: PermissionType[];
		position: number;
	}) {
		return await this.prismaService.role.create({
			data: {
				...input,
				hideInNav: true,
				permissions: JSON.stringify(input.permissions),
			},
		});
	}
	async findRoleInGuild(guildId: string) {
		return await this.prismaService.role.findMany({
			where: {
				guildId,
			},
		});
	}
	GetRoleModel() {
		return this.prismaService.role;
	}
	async findRoleById(id: string) {
		return await this.prismaService.role.findFirst({
			where: {
				id,
			},
		});
	}
	async addMemberToRole(roleId: string, meberId: string) {
		return this.prismaService.role.update({
			where: {
				id: roleId,
			},
			data: {
				member: {
					connect: {
						id: meberId,
					},
				},
			},
		});
	}
	async deleteAllGuildRole(guildID: string) {
		return await this.prismaService.role.deleteMany({
			where: {
				guildId: guildID,
			},
		});
	}
	async findGuildByID(id: string) {
		return await this.prismaService.guild.findUnique({
			where: {
				id,
			},
		});
	}
	async CreateRole(input: {
		RoleName: string;
		guildId: string;
		permissions?: PermissionType[];
		position: number;
		hideInNav: boolean;
		color: string;
	}) {
		return await this.prismaService.role.create({
			data: {
				...input,
				permissions: JSON.stringify(input.permissions || []),
			},
		});
	}
	async findRoleInGuildHadSamePosition(position: number, guildID: string) {
		return this.prismaService.role.findFirst({
			where: {
				guildId: guildID,
				position,
			},
		});
	}
	async getMemberPermission(guildId: string, userId: string) {
		return await this.memberService.MemberUtilCheckPermission(userId, guildId);
	}
}
