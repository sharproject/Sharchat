import { Injectable } from '@nestjs/common';
import { PermissionType, Role, RoleDocument } from '../model/Role';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class RoleService {
    constructor(
        @InjectModel(Role.name) private RoleModel: Model<RoleDocument>,
    ) {}
    async CreateEveryoneRoleForGuild(input: {
        RoleName: string;
        guild: string;
        permissions: PermissionType[];
        position: number;
    }) {
        return await new this.RoleModel(input).save();
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
