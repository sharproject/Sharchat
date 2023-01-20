import { MemberDocument, MemberModel } from '../model/Member';
import { UserModel } from '../model/User';
import { GuildModel } from '../model/Guild';

import permissions from '../configuration/permissions';
import { RoleModel } from '../model/Role';

export const MemberUtil = {
    DeleteMember: async (
        guildId: string | undefined,
        userId: string | undefined,
    ) => {
        if (!userId) {
            throw new Error('Guild ID/User ID is not provided');
        }

        const user = await UserModel.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        const member = await MemberModel.findOne({
            userId: user._id,
            guildId: guildId,
        });
        if (!member) {
            throw new Error('Member not found');
        }
        await GuildModel.findByIdAndUpdate(guildId, {
            $pull: {
                members: member._id,
            },
        });
        user.update({
            $pull: {
                guilds: guildId,
            },
        });
        await member.delete();

        return member;
    },
};
