export declare class Message {
    _id: string;
    createdAt: Date;
    updatedAt: Date;
    User: string;
    Channel: string;
    threadId: string;
}
export declare const MessageModel: import("@typegoose/typegoose").ReturnModelType<typeof Message, import("@typegoose/typegoose/lib/types").BeAnObject>;
