import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Member, MemberDocument } from '../model/Member';
import { Model } from 'mongoose';
import { UserService } from '../user/user.service';
import { Guild, GuildDocument } from '../model/Guild';
import permissions from 'src/configuration/permissions';
import { RoleDocument } from 'src/model/Role';
import { RoleService } from 'src/role/role.service';
import mongoose from 'mongoose';

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
        const member = await new this.MemberModel({
            user: user,
            guild: guild,
            Role: [guild.everyoneRole._id],
            ...options,
        }).save();
        user.guilds.push(guild);
        const everyoneRole = await this.roleService.findRoleById(
            guild.everyoneRole._id,
        );
        await member.save();
        everyoneRole?.member.push(member);
        guild.members.push(member);
        await everyoneRole?.save();
        await guild.save();
        await member.save();
        await user.save();
        return this.findMemberById(member._id);
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
    async findGuildById(id: string) {
        return await this.guildModel.findById(id);
    }
    async findMemberByUserIdAndGuildId(userId: string, guildId: string) {
        return await this.MemberModel.findOne({
            user: userId,
            guild: guildId,
        });
    }
    async findRoleById(id: string) {
        return this.roleService.findRoleById(id);
    }
    async MemberUtilDeleteMember(
        guildId: string | undefined,
        userId: string | undefined,
        onlyMember: boolean = false,
    ) {
        if (!userId) {
            throw new Error('Guild ID/User ID is not provided');
        }
        const user = await this.userService.findUserByID(userId);
        if (!user) {
            throw new Error('User not found');
        }
        const member = await this.MemberModel.findOne({
            userId: user._id,
            guildId: guildId,
        });
        if (!member) {
            throw new Error('Member not found');
        }
        if (!onlyMember) {
            await this.guildModel.findByIdAndUpdate(guildId, {
                $pull: {
                    members: member._id,
                },
            });
            for (let role of member.Role) {
                await this.roleService
                    .GetRoleModel()
                    .findByIdAndUpdate(role._id, {
                        $pull: {
                            member: member._id,
                        },
                    });
            }
        }

        await user.updateOne({
            $pull: {
                guilds: new mongoose.Types.ObjectId(guildId),
            },
        });

        await member.delete();

        return member;
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
