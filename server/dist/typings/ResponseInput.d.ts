import express from 'express';
interface BaseResponseLocals {
}
interface ResponseLocalDataWhenAuth extends BaseResponseLocals {
    userId?: string;
}
interface ResponseLocalDataWhenNotAuth extends BaseResponseLocals {
}
declare type ResponseLocalData<auth = false> = auth extends true ? ResponseLocalDataWhenAuth : ResponseLocalDataWhenNotAuth;
export declare type Response<auth = false, ResBody = unknown> = express.Response<ResBody, ResponseLocalData<auth>>;
export {};
