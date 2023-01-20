import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Member, MemberDocument } from '../model/Member';
import { Model } from 'mongoose';
import { UserService } from '../user/user.service';
import { Guild, GuildDocument } from '../model/Guild';
import permissions from 'src/configuration/permissions';
import { RoleDocument } from 'src/model/Role';
import { RoleService } from 'src/role/role.service';

export interface CreateMemberOption {
    isOwner: boolean;
}

@Injectable()
export class MemberService {
    constructor(
        @InjectModel(Member.name) private MemberModel: Model<MemberDocument>,
        private readonly userService: UserService,
        @InjectModel(Guild.name) private guildModel: Model<GuildDocument>,
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
        const user = await this.userService.findUserByID(userId);
        if (!user) {
            throw new Error('User not found');
        }

        const guild = await this.guildModel.findById(guildId);
        if (!guild) {
            throw new Error('Guild not found');
        }
        const member = new this.MemberModel({
            user: user,
            guild: guild,
            Role: [],
            ...options,
        });
        user.update({
            $push: {
                guilds: guildId,
            },
        });
        await member.save();
        return member;
    }
    async findMemberById(id: string) {
        return await this.MemberModel.findById(id);
    }
    async findMemberInGuild(guildId: string) {
        return await this.MemberModel.find({
            guild: guildId,
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

        const guild = await this.guildModel.findById(guildId);

        if (!guild) {
            throw new Error('Guild not found');
        }

        const member = await this.MemberModel.findOne({
            user: user._id,
            guild: guild._id,
        });

        if (!member) {
            throw new Error('Member not found');
        }

        let permissionUtil = new PermissionUtilClass(member.isOwner);

        if (!member.isOwner) {
            for (let role_id in member.Role) {
                if (
                    await permissionUtil.addRole(
                        role_id,
                        this.roleService.GetRoleModel(),
                    )
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
        let role = await RoleModel.findById(roleId);
        if (!role) {
            return true;
        }
        let permissions = role.permissions.map((i) => i.name);
        for (let p of role.permissions) {
            if (p.metadata) {
                if (p.metadata.name == 'view_channel') {
                    this.metadata.ViewChannel.Block.push(
                        ...p.metadata.block_channel,
                    );
                    this.metadata.ViewChannel.Allow.push(
                        ...p.metadata.allow_channel,
                    );
                } else if (p.metadata.name == 'send_message') {
                    this.metadata.SendMessage.Block.push(
                        ...p.metadata.block_channel,
                    );
                    this.metadata.SendMessage.Allow.push(
                        ...p.metadata.allow_channel,
                    );
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
