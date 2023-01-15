export declare class Guild {
    _id: string;
    createdAt: Date;
    updatedAt: Date;
    name: string;
    description: string;
    owner: string;
    members: string[];
    channels: string[];
}
export declare const GuildModel: import("@typegoose/typegoose").ReturnModelType<typeof Guild, import("@typegoose/typegoose/lib/types").BeAnObject>;
