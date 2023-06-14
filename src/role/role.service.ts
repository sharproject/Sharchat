import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PermissionType } from '../typings';

@Injectable()
export class RoleService {
	constructor(private readonly prismaService: PrismaService) {}
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
				permissions: JSON.stringify(input.permissions)
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
}
