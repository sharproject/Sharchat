import { Injectable } from '@nestjs/common';
import { CreateMemberOption, MemberService } from '../member/member.service';
import { RoleService } from '../role/role.service';
import { everyonePermissionDefault } from '../configuration/permissions';
import { UserService } from 'src/user/user.service';
import { CreateGuildInput } from '../typings/Guild';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class GuildService {
	constructor(
		public readonly memberService: MemberService,
		public readonly roleService: RoleService,
		public readonly userService: UserService,
		public readonly prismaService: PrismaService,
	) {}
	async CreateNewGuildForRoute(
		{ name, description = '' }: CreateGuildInput,
		owner: string,
	) {
		const ownerObj = await this.userService.findUserByID(owner);
		if (!ownerObj) throw new Error('error cmnr');
		return await this.prismaService.guild.create({
			data: {
				name: name,
				description: description,
				owner: {
					connect: {
						id: ownerObj.id,
					},
				},
				everyoneRoleId: '',
			},
		});
	}
	async findGuildById<
		T extends {
			owner?: boolean;
			members?: boolean;
			channels?: boolean;
			roles?: boolean;
			_count?: boolean;
		},
	>(id: string, include?: T) {
		return await this.prismaService.guild.findUnique({
			where: {
				id,
			},
			include: {
				...include,
			},
		});
	}

	async OnlyThisModule_CreateMember(
		guildId: string | undefined,
		userId: string | undefined,
		options: CreateMemberOption,
	) {
		return await this.memberService.MemberUtilCreateMember(
			guildId,
			userId,
			options,
		);
	}
	async OnlyThisModule_CreateDefaultRoleForGuild(GuildID: string) {
		return await this.roleService.CreateEveryoneRoleForGuild({
			RoleName: '@everyone',
			guildId: GuildID,
			permissions: everyonePermissionDefault,
			position: 1,
		});
	}
	async DeleteGuild(id: string) {
		return await this.prismaService.guild.delete({
			where: {
				id,
			},
		});
	}
	async UpdateGuildInfo(
		input: {
			name: string;
			description: string;
		},
		id: string,
	) {
		return await this.prismaService.guild.update({
			where: { id },
			data: { ...input },
		});
	}
}
