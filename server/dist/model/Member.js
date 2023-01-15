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
    Member: ()=>Member,
    MemberModel: ()=>MemberModel
});
const _typegoose = require("@typegoose/typegoose");
const _role = require("./Role");
var __decorate = (void 0) && (void 0).__decorate || function(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (void 0) && (void 0).__metadata || function(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
let Member = class Member {
};
__decorate([
    (0, _typegoose.prop)({
        required: true,
        default: Date.now(),
        type: ()=>Date
    }),
    __metadata("design:type", typeof Date === "undefined" ? Object : Date)
], Member.prototype, "joinedAt", void 0);
__decorate([
    (0, _typegoose.prop)({
        required: true,
        default: Date.now()
    }),
    __metadata("design:type", typeof Date === "undefined" ? Object : Date)
], Member.prototype, "updatedAt", void 0);
__decorate([
    (0, _typegoose.prop)({
        required: true
    }),
    __metadata("design:type", String)
], Member.prototype, "userId", void 0);
__decorate([
    (0, _typegoose.prop)({
        required: true
    }),
    __metadata("design:type", String)
], Member.prototype, "guildId", void 0);
__decorate([
    (0, _typegoose.prop)({
        required: true,
        default: [],
        ref: ()=>_role.Role
    }),
    __metadata("design:type", typeof Array === "undefined" ? Object : Array)
], Member.prototype, "Role", void 0);
__decorate([
    (0, _typegoose.prop)({
        default: false
    }),
    __metadata("design:type", Boolean)
], Member.prototype, "isOwner", void 0);
Member = __decorate([
    (0, _typegoose.modelOptions)({
        schemaOptions: {
            timestamps: true
        }
    })
], Member);
const MemberModel = (0, _typegoose.getModelForClass)(Member);
