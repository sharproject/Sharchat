import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GuildEntity, GuildDocument } from 'src/model/Guild';
import { CreateMemberOption, MemberService } from '../member/member.service';
import { RoleService } from '../role/role.service';
import { everyonePermissionDefault } from '../configuration/permissions';
import { UserService } from 'src/user/user.service';
import { CreateGuildInput } from '../typings/Guild';

@Injectable()
export class GuildService {
	constructor(
		@InjectModel(GuildEntity.name) private GuildModel: Model<GuildDocument>,
		public readonly memberService: MemberService,
		public readonly roleService: RoleService,
		public readonly userService: UserService,
	) {}
	async CreateNewGuildForRoute(
		{ name, description }: CreateGuildInput,
		owner: string,
	) {
		const ownerObj = await this.userService.findUserByID(owner);
		return await new this.GuildModel({
			name,
			description,
			owner: ownerObj,
		}).save();
	}
	async CreateGuild<T>(input: T) {
		return await new this.GuildModel(input).save();
	}
	async findGuildById(id: string) {
		return await this.GuildModel.findById(id);
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
