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
    Guild: ()=>Guild,
    GuildModel: ()=>GuildModel
});
const _typegoose = require("@typegoose/typegoose");
const _user = require("./User");
const _member = require("./Member");
const _channel = require("./Channel");
var __decorate = (void 0) && (void 0).__decorate || function(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (void 0) && (void 0).__metadata || function(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
let Guild = class Guild {
};
__decorate([
    (0, _typegoose.prop)({
        required: true,
        default: Date.now(),
        type: ()=>Date
    }),
    __metadata("design:type", typeof Date === "undefined" ? Object : Date)
], Guild.prototype, "createdAt", void 0);
__decorate([
    (0, _typegoose.prop)({
        required: true,
        default: Date.now()
    }),
    __metadata("design:type", typeof Date === "undefined" ? Object : Date)
], Guild.prototype, "updatedAt", void 0);
__decorate([
    (0, _typegoose.prop)({
        required: true
    }),
    __metadata("design:type", String)
], Guild.prototype, "name", void 0);
__decorate([
    (0, _typegoose.prop)({
        required: true
    }),
    __metadata("design:type", String)
], Guild.prototype, "description", void 0);
__decorate([
    (0, _typegoose.prop)({
        required: true,
        ref: ()=>_user.User
    }),
    __metadata("design:type", String)
], Guild.prototype, "owner", void 0);
__decorate([
    (0, _typegoose.prop)({
        required: true,
        default: [],
        ref: ()=>_member.Member
    }),
    __metadata("design:type", Array)
], Guild.prototype, "members", void 0);
__decorate([
    (0, _typegoose.prop)({
        required: true,
        default: [],
        ref: ()=>_channel.Channel
    }),
    __metadata("design:type", Array)
], Guild.prototype, "channels", void 0);
Guild = __decorate([
    (0, _typegoose.modelOptions)({
        schemaOptions: {
            timestamps: true
        }
    })
], Guild);
const GuildModel = (0, _typegoose.getModelForClass)(Guild);
