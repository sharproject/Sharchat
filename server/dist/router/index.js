"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "SetupPath", {
    enumerable: true,
    get: ()=>SetupPath
});
const _channel = require("../controller/Channel");
const _guild = require("../controller/Guild");
const _member = require("../controller/Member");
const _user = require("../controller/User");
function SetupPath(app) {
    _user.UserController.SetupForRootApp("/user", app);
    _member.MemberController.SetupForRootApp("/member", app);
    _guild.GuildController.SetupForRootApp("/guild", app);
    _channel.ChannelController.SetupForRootApp("/channel", app);
}
