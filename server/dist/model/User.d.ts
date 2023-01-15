export declare class User {
    username: string;
    password: string;
    email: string;
    _id: string;
    createdAt: Date;
    updatedAt: Date;
    guilds: string[];
}
export declare const UserModel: import("@typegoose/typegoose").ReturnModelType<typeof User, import("@typegoose/typegoose/lib/types").BeAnObject>;
