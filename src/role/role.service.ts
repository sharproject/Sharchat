import { Injectable } from '@nestjs/common';
import { PermissionType, Role, RoleDocument } from '../model/Role';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RoleService {
	constructor(
		private readonly prismaService: PrismaService,
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
}
