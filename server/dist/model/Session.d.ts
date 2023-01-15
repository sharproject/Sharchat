export declare class Session {
    _id: string;
    createdAt: Date;
    updatedAt: Date;
    UserId: string;
}
export declare const SessionModel: import("@typegoose/typegoose").ReturnModelType<typeof Session, import("@typegoose/typegoose/lib/types").BeAnObject>;
