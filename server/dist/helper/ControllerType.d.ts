import { NextFunction, Request } from 'express';
import { Response } from '../typings/ResponseInput';
import { Router } from 'express';
export interface ControllerInformation {
    RequestBody?: {
        [key: string]: any | {
            optional?: boolean;
            type?: any;
        };
    };
    RequestQuery?: {
        [key: string]: any | {
            optional?: boolean;
            type?: any;
        };
    };
    ControllerName: string;
    RequestMethod?: 'get' | 'post' | 'put' | 'delete' | 'patch';
}
export interface ControllerType<auth = false, TResponse = unknown> extends ControllerInformation {
    (req: Request, res: Response<auth, TResponse>, next: NextFunction): Promise<unknown> | unknown | void | Promise<void> | any;
    Middleware?: TControllerMiddlewareFn[];
}
export declare type TControllerMiddlewareFn<auth = false, TResponse = unknown> = ((req: Request, res: Response<auth, TResponse>, next: NextFunction) => any) & {
    MiddlewareName?: string;
    description?: string;
};
interface ControllerDocumentJsonReturnType {
    api: {
        [key: string]: any[];
    };
}
export declare class ControllerDocument {
    controller: {
        name: string;
        controller: Controller;
    }[];
    constructor(controller: {
        name: string;
        controller: Controller;
    }[]);
    json(): ControllerDocumentJsonReturnType;
}
export declare var ControllerDocumentRouterHandler: ControllerDocument;
export declare class Controller {
    controller: ControllerType[];
    root_path: string;
    subController: Controller[];
    controllers: Map<string, ControllerType>;
    allMiddleware: TControllerMiddlewareFn[];
    constructor(controller: ControllerType[], root_path: string, subController?: Controller[]);
    SetupRouter(router: Router): void;
    checkRequestBody(req: Request, res: Response<false>, next: NextFunction): void;
    checkRequestQuery(req: Request, res: Response<false>, next: NextFunction): void;
    SetupForRootApp(path: string, app: import('express').Express): import("express-serve-static-core").Router;
    SetMiddleware(allMiddleware: TControllerMiddlewareFn[]): this;
    SetSubController(subController: Controller[]): this;
}
export {};
