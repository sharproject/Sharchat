export declare class Member {
    _id: string;
    joinedAt: Date;
    updatedAt: Date;
    userId: string;
    guildId: string;
    Role: Array<string>;
    isOwner: boolean;
}
export declare const MemberModel: import("@typegoose/typegoose").ReturnModelType<typeof Member, import("@typegoose/typegoose/lib/types").BeAnObject>;
