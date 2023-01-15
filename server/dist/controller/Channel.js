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
    CreateChannel: ()=>CreateChannel,
    CreateChannelMiddleware: ()=>CreateChannelMiddleware,
    ChannelController: ()=>ChannelController
});
const _controllerType = require("../helper/ControllerType");
const _auth = require("../middleware/auth");
const CreateChannel = async (_req, res, _next)=>{
    res.send("hello");
};
CreateChannel.ControllerName = 'create';
CreateChannel.RequestMethod = "get";
const CreateChannelMiddleware = async (_, _r, next)=>{
    console.log("middleware");
    next();
};
CreateChannelMiddleware.MiddlewareName = "siuuuuuu";
CreateChannelMiddleware.description = "siuuuuuuuuuu";
CreateChannel.Middleware = [];
CreateChannel.Middleware?.push(CreateChannelMiddleware);
const ChannelController = new _controllerType.Controller([
    CreateChannel
], "/channel").SetMiddleware([
    _auth.AuthMiddleware
]);
