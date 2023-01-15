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
    CreateGuild: ()=>CreateGuild,
    DeleteGuild: ()=>DeleteGuild,
    EditGuild: ()=>EditGuild,
    GuildController: ()=>GuildController
});
const _guild = require("../model/Guild");
const _member = require("../model/Member");
const _controllerType = require("../helper/ControllerType");
const _member1 = require("../util/Member");
const _auth = require("../middleware/auth");
const _channel = require("./Channel");
const CreateGuild = async (req, res)=>{
    const { name , description  } = req.body;
    if (!name || !description) {
        res.status(400).json({
            message: 'Missing required fields'
        });
        return;
    }
    try {
        const guild = await new _guild.GuildModel({
            name,
            description,
            owner: res.locals.userId
        }).save();
        const member = await _member1.MemberUtil.CreateMember(guild._id, res.locals.userId, {
            isOwner: true
        });
        guild.members.push(member._id);
        await guild.save();
        res.status(201).json({
            message: 'Guild created',
            guild
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: 'Error creating guild'
        });
    }
};
CreateGuild.ControllerName = 'create';
CreateGuild.RequestMethod = 'post';
CreateGuild.RequestBody = {
    name: 'string',
    description: String
};
const DeleteGuild = async (req, res)=>{
    const { id  } = req.body;
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
        const result = await _member1.MemberUtil.CheckPermissions(res.locals.userId, guild._id, {
            isOwner: true
        });
        if (!result.isOwner) {
            res.status(403).json({
                message: 'Requested user is not the guild owner'
            });
            return;
        }
        try {
            const members = await _member.MemberModel.find({
                guildId: guild._id
            });
            members.map((d)=>d.delete());
        } catch (err) {
            console.log(err);
        }
        await guild.delete();
        res.status(200).json({
            message: 'Guild deleted'
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: 'Error deleting guild'
        });
    }
};
DeleteGuild.ControllerName = 'delete';
DeleteGuild.RequestMethod = 'delete';
DeleteGuild.RequestBody = {
    id: 'string'
};
const EditGuild = async (req, res)=>{
    const { id , name , description  } = req.body;
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
        const result = await _member1.MemberUtil.CheckPermissions(res.locals.userId, guild._id, {
            isOwner: true
        });
        if (!result.isOwner && !result.permissions.includes('admin') && !result.permissions.includes('server_manager')) {
            res.status(403).json({
                message: "Requested member doesn't have permission to edit"
            });
            return;
        }
        if (name && typeof name == 'string' || description && typeof description == 'string') {
            if (name && typeof name == 'string') guild.name = name;
            if (description && typeof description == 'string') guild.description = description;
            await guild.save();
        }
        res.status(200).json({
            message: 'Guild edited',
            guild
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: 'Error editing guild'
        });
    }
};
EditGuild.ControllerName = 'edit';
EditGuild.RequestMethod = 'patch';
EditGuild.RequestBody = {
    id: 'string',
    name: {
        type: 'string',
        optional: true
    },
    description: {
        type: 'string',
        optional: true
    }
};
const GuildController = new _controllerType.Controller([
    CreateGuild,
    DeleteGuild,
    EditGuild
], "/guild").SetMiddleware([
    _auth.AuthMiddleware
]).SetSubController([
    _channel.ChannelController
]);
