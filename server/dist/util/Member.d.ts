/// <reference types="mongoose/types/aggregate" />
/// <reference types="mongoose/types/callback" />
/// <reference types="mongoose/types/collection" />
/// <reference types="mongoose/types/connection" />
/// <reference types="mongoose/types/cursor" />
/// <reference types="mongoose/types/document" />
/// <reference types="mongoose/types/error" />
/// <reference types="mongoose/types/expressions" />
/// <reference types="mongoose/types/helpers" />
/// <reference types="mongoose/types/middlewares" />
/// <reference types="mongoose/types/indexes" />
/// <reference types="mongoose/types/models" />
/// <reference types="mongoose/types/mongooseoptions" />
/// <reference types="mongoose/types/pipelinestage" />
/// <reference types="mongoose/types/populate" />
/// <reference types="mongoose/types/query" />
/// <reference types="mongoose/types/schemaoptions" />
/// <reference types="mongoose/types/schematypes" />
/// <reference types="mongoose/types/session" />
/// <reference types="mongoose/types/types" />
/// <reference types="mongoose/types/utility" />
/// <reference types="mongoose/types/validation" />
/// <reference types="mongoose/types/virtuals" />
/// <reference types="mongoose" />
/// <reference types="mongoose/types/inferschematype" />
import permissions from '../configuration/permissions';
interface CheckPermissionsOptions {
    some?: Array<keyof typeof permissions> | null;
    every?: Array<keyof typeof permissions> | null;
    isOwner?: true | false | null;
}
interface CreateMemberOption {
    isOwner: boolean;
}
export declare const MemberUtil: {
    CreateMember: (guildId: string | undefined, userId: string | undefined, options: CreateMemberOption) => Promise<import("mongoose").Document<string, import("@typegoose/typegoose/lib/types").BeAnObject, import("../model/Member").Member> & import("../model/Member").Member & import("@typegoose/typegoose/lib/types").IObjectWithTypegooseFunction & Required<{
        _id: string;
    }>>;
    DeleteMember: (guildId: string | undefined, userId: string | undefined) => Promise<import("mongoose").Document<string, import("@typegoose/typegoose/lib/types").BeAnObject, import("../model/Member").Member> & import("../model/Member").Member & import("@typegoose/typegoose/lib/types").IObjectWithTypegooseFunction & Required<{
        _id: string;
    }>>;
    CheckPermissions: (userId: string | undefined, guildId: string, { some, every, isOwner }: CheckPermissionsOptions) => Promise<{
        permissions: Array<keyof typeof permissions>;
        some?: boolean | undefined;
        every?: boolean | undefined;
        isOwner?: boolean | undefined;
    }>;
};
export {};
