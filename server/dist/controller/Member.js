"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    JoinGuild: ()=>JoinGuild,
    LeaveGuild: ()=>LeaveGuild,
    RemoveMember: ()=>RemoveMember,
    MemberController: ()=>MemberController
});
const _member = require("../util/Member");
const _member1 = require("../model/Member");
const _guild = require("../model/Guild");
const _controllerType = require("../helper/ControllerType");
const _auth = require("../middleware/auth");
const JoinGuild = async (req, res)=>{
    const id = req.body.id;
    if (!id) {
        res.status(400).json({
            message: 'Missing required fields'
        });
        return;
    }
    try {
        const guild = await _guild.GuildModel.findById(id);
        if (!guild) {
            res.status(400).json({
                message: 'Guild not found'
            });
            return;
        }
        let member = await _member1.MemberModel.findOne({
            userId: res.locals.userId,
            guildId: guild._id
        });
        if (member) {
            res.status(200).send({
                message: 'Requested user already joined the guild'
            });
            return;
        }
        member = await _member.MemberUtil.CreateMember(guild._id, res.locals.userId, {
            isOwner: false
        });
        guild.members.push(member.userId);
        await guild.save();
        res.status(201).send({
            message: 'Joined guild'
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: 'Error joining guild'
        });
    }
};
JoinGuild.ControllerName = 'join';
JoinGuild.RequestMethod = 'post';
JoinGuild.RequestBody = {
    id: 'string'
};
const LeaveGuild = async (req, res)=>{
    const id = req.body.id;
    if (!id) {
        res.status(400).json({
            message: 'Missing required fields'
        });
        return;
    }
    try {
        const guild = await _guild.GuildModel.findById(id);
        if (!guild) {
            res.status(400).json({
                message: 'Guild not found'
            });
            return;
        }
        let member = await _member1.MemberModel.findOne({
            userId: res.locals.userId,
            guildId: guild._id
        });
        if (!member) {
            res.status(200).send({
                message: "Requested user isn't in the guild"
            });
            return;
        }
        if (member.userId == guild.owner) {
            res.status(403).send({
                message: "Guild owner can't leave guild, transfer or delete it instead"
            });
            return;
        }
        member = await _member.MemberUtil.DeleteMember(guild._id, res.locals.userId);
        const newGuildMembers = guild.members.filter((m)=>m !== res.locals.userId);
        guild.members = newGuildMembers;
        await guild.save();
        res.status(200).send({
            message: 'Left guild'
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: 'Error leaving guild'
        });
    }
};
LeaveGuild.ControllerName = 'leave', LeaveGuild.RequestMethod = 'delete', LeaveGuild.RequestBody = {
    id: 'string'
};
const RemoveMember = async (req, res)=>{
    const userId = req.body.userId;
    const guildId = req.body.guildId;
    if (!userId || !guildId) {
        res.status(400).json({
            message: 'Missing required fields'
        });
        return;
    }
    try {
        const guild = await _guild.GuildModel.findById(guildId);
        if (!guild) {
            res.status(400).json({
                message: 'Guild not found'
            });
            return;
        }
        const requested = await _member1.MemberModel.findOne({
            userId: res.locals.userId,
            guildId: guild._id
        });
        if (!requested) {
            res.status(403).send({
                message: "Requested user isn't in the guild"
            });
            return;
        }
        if (!requested.permissions.find((v)=>v == 'admin' || v == 'moderator') && !requested.isOwner && requested.userId !== guild.owner) {
            res.status(403).send({
                message: 'Missing permissions'
            });
            return;
        }
        let member = await _member1.MemberModel.findOne({
            userId: userId,
            guildId: guild._id
        });
        if (!member) {
            res.status(403).send({
                message: "Can't find valid user with the provided ID in the guild"
            });
            return;
        }
        if (member.permissions.find((v)=>v == 'admin' || v == 'moderator') || member.isOwner || member.userId == guild.owner) {
            res.status(403).send({
                message: "You can't remove this member from the guild. They are Admin, Moderator or Server Owner"
            });
            return;
        }
        member = await _member.MemberUtil.DeleteMember(guild._id, userId);
        const newGuildMembers = guild.members.filter((m)=>m !== userId);
        guild.members = newGuildMembers;
        await guild.save();
        res.status(200).send({
            message: 'Removed member from the guild'
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: 'Error leaving guild'
        });
    }
};
RemoveMember.ControllerName = 'remove', RemoveMember.RequestMethod = 'delete', RemoveMember.RequestBody = {
    userId: 'string',
    guildId: 'string'
};
const MemberController = new _controllerType.Controller([
    JoinGuild,
    LeaveGuild,
    RemoveMember
], "/member").SetMiddleware([
    _auth.AuthMiddleware
]);
