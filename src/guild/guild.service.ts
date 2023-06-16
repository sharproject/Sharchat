import { Injectable } from '@nestjs/common';
import { CreateMemberOption, MemberService } from '../member/member.service';
import { RoleService } from '../role/role.service';
import { everyonePermissionDefault } from '../configuration/permissions';
import { UserService } from 'src/user/user.service';
import { CreateGuildInput } from '../typings/Guild';
import { PrismaService } from 'src/prisma/prisma.service';
import { GuildModule } from './guild.module';
import { Guild } from 'src/model/Guild';
import { StringDecoder } from 'string_decoder';
import { stringify } from 'querystring';
import { isStringObject } from 'util/types';
import { IsUUID } from 'class-validator';
import { userInfo } from 'os';
import { identity } from 'rxjs';
import { StringArraySupportOption } from 'prettier';



@Injectable()
export class GuildService {
	constructor(
		public readonly prismaService : PrismaService,
		public readonly memberService: MemberService,
		public readonly roleService: RoleService,
		public readonly userService: UserService,
	) {}
	async CreateNewGuildForRoute(
	{ name, description = ''}: CreateGuildInput,
		owner: string,
	) {
		const ownerObj = await this.userService.findUserByID(owner);
		if (!ownerObj) throw new Error("error cmnr");
		return await this.prismaService.guild.create({
			data : {
				name : name,			
				description : description ,			
				owner : {
					connect: {
						id : ownerObj.id
					}
				},
				everyoneRoleId : ''
			},
		});
	}
	async findGuildById(id: string) {
		return await this.prismaService.findById(id);
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
}
