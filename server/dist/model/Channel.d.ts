export declare class Channel {
    _id: string;
    createdAt: Date;
    updatedAt: Date;
    name: string;
    description: string;
    guild: string;
    owner: string;
}
export declare const ChannelModel: import("@typegoose/typegoose").ReturnModelType<typeof Channel, import("@typegoose/typegoose/lib/types").BeAnObject>;
