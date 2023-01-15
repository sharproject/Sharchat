/* eslint-disable no-mixed-spaces-and-tabs */ /* eslint-disable @typescript-eslint/no-explicit-any */ "use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    ControllerDocument: ()=>ControllerDocument,
    ControllerDocumentRouterHandler: ()=>ControllerDocumentRouterHandler,
    Controller: ()=>Controller
});
const _express = require("express");
class ControllerDocument {
    json() {
        let result = {
            api: {}
        };
        for (let c of this.controller){
            // group
            let controllerJson = {};
            for (let con of c.controller.controller){
                controllerJson[con.ControllerName] = con;
            }
            result.api[c.name] = controllerJson;
        }
        return result;
    }
    constructor(controller){
        this.controller = controller;
    }
}
var ControllerDocumentRouterHandler = new ControllerDocument([]);
class Controller {
    SetupRouter(router) {
        for (const [name, controller] of this.controllers){
            router[controller.RequestMethod || 'post'](name.startsWith('/') ? name : `/${name}`, ...this.allMiddleware, ...controller.Middleware ? controller.Middleware : [], this.checkRequestBody.bind(this), this.checkRequestQuery.bind(this), controller);
        }
        for (let c of this.subController){
            c.root_path = this.root_path + (c.root_path.startsWith('/') ? c.root_path : '/' + c.root_path);
            let n_router = (0, _express.Router)();
            c.SetupRouter(n_router);
            router.use(n_router);
        }
        ControllerDocumentRouterHandler.controller.push({
            name: this.root_path,
            controller: this
        });
    }
    checkRequestBody(req, res, next) {
        req.url = req.protocol + '://' + req.get('host') + req.originalUrl;
        const controller = this.controllers.get(new URL(req.url).pathname.split('/')[2]);
        if (!controller) {
            res.status(400).json({
                message: 'Controller not found'
            });
            return;
        }
        if (controller.RequestBody) {
            const RequestBody = {};
            for(const key in controller.RequestBody){
                if (!req.body[key] && !controller.RequestBody[key].optional) {
                    res.status(400).json({
                        message: 'Missing required fields'
                    });
                    return;
                }
                if (!checkType(controller.RequestBody[key], req.body[key]) && !controller.RequestBody[key].optional) {
                    res.status(400).json({
                        message: 'Missing required fields'
                    });
                    return;
                }
                RequestBody[key] = req.body[key];
            }
            req.body = RequestBody;
        }
        next();
    }
    checkRequestQuery(req, res, next) {
        req.url = req.protocol + '://' + req.get('host') + req.originalUrl;
        const controller = this.controllers.get(new URL(req.url).pathname.split('/')[2]);
        if (!controller) {
            res.status(400).json({
                message: 'Controller not found'
            });
            return;
        }
        if (controller.RequestQuery) {
            for(const key in controller.RequestQuery){
                if (!req.query[key]) {
                    res.status(400).json({
                        message: 'Missing required fields'
                    });
                    return;
                }
                if (!checkType(controller.RequestQuery[key], req.query[key])) {
                    res.status(400).json({
                        message: 'Missing required fields'
                    });
                    return;
                }
            }
        }
        next();
    }
    SetupForRootApp(path, app) {
        this.root_path = path;
        let router = (0, _express.Router)();
        this.SetupRouter(router);
        app.use(path, router);
        return router;
    }
    SetMiddleware(allMiddleware) {
        this.allMiddleware = allMiddleware;
        return this;
    }
    SetSubController(subController) {
        this.subController = subController;
        return this;
    }
    constructor(controller, root_path, subController = []){
        this.controller = controller;
        this.root_path = root_path;
        this.subController = subController;
        this.controllers = new Map();
        this.allMiddleware = [];
        for (const c of controller){
            this.controllers.set(c.ControllerName, c);
        }
    }
}
function checkType(type, value) {
    if (type == 'array') return Array.isArray(value);
    return typeof value == type;
}
