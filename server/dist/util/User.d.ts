export declare const UserUtil: {
    GenToken: (userId: string) => Promise<string>;
    VerifyToken: (token: string) => Promise<string | Error>;
};
