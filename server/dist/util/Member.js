"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "MemberUtil", {
    enumerable: true,
    get: ()=>MemberUtil
});
const _member = require("../model/Member");
const _user = require("../model/User");
const _guild = require("../model/Guild");
const _path = /*#__PURE__*/ _interopRequireDefault(require("path"));
const _dotenv = /*#__PURE__*/ _interopRequireDefault(require("dotenv"));
function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
_dotenv.default.config({
    path: _path.default.join(__dirname, '..', '..', '.env')
});
const MemberUtil = {
    CreateMember: async (guildId, userId, options)=>{
        if (!guildId || !userId) {
            throw new Error('Guild ID/User ID is not provided');
        }
        if (!options.isOwner) options.isOwner = false;
        const user = await _user.UserModel.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }
        const guild = await _guild.GuildModel.findById(guildId);
        if (!guild) {
            throw new Error('Guild not found');
        }
        const member = new _member.MemberModel({
            userId: user._id,
            guildId: guild._id,
            permissions: [],
            ...options
        });
        await member.save();
        return member;
    },
    DeleteMember: async (guildId, userId)=>{
        if (!userId) {
            throw new Error('Guild ID/User ID is not provided');
        }
        const user = await _user.UserModel.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }
        const member = await _member.MemberModel.findOne({
            userId: user._id,
            guildId: guildId
        });
        if (!member) {
            throw new Error('Member not found');
        }
        await member.delete();
        return member;
    },
    CheckPermissions: async (userId, guildId, { some , every , isOwner  })=>{
        if (!userId || !guildId) {
            throw new Error('User ID/Guild ID is not provided');
        }
        const user = await _user.UserModel.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }
        const guild = await _guild.GuildModel.findById(guildId);
        if (!guild) {
            throw new Error('Guild not found');
        }
        const member = await _member.MemberModel.findOne({
            userId: user._id,
            guildId: guild._id
        });
        if (!member) {
            throw new Error('Member not found');
        }
        const result = {
            permissions: member.permissions
        };
        if (some || every || isOwner) {
            result.some = member.permissions.some((perm)=>some?.includes(perm));
            result.every = member.permissions.every((perm)=>every?.includes(perm));
            result.isOwner = member.isOwner;
        }
        return result;
    }
};
