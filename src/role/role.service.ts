import { Injectable } from '@nestjs/common';
import { PermissionType, Role, RoleDocument } from '../model/Role';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Guild, GuildDocument } from '../model/Guild';

@Injectable()
export class RoleService {
	constructor(
		@InjectModel(Role.name) private RoleModel: Model<RoleDocument>,
		@InjectModel(Guild.name) private GuildModel: Model<GuildDocument>,
	) {}
	async CreateEveryoneRoleForGuild(input: {
		RoleName: string;
		guild: string;
		permissions: PermissionType[];
		position: number;
	}) {
		return await new this.RoleModel({ ...input, hideInNav: true }).save();
	}
	async findRoleInGuild(guildId: string) {
		return await this.RoleModel.find({
			guild: guildId,
		});
	}
	GetRoleModel() {
		return this.RoleModel;
	}
	async findRoleById(id: string) {
		return await this.RoleModel.findById(id);
	}
}
