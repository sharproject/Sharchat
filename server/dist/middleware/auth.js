"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "AuthMiddleware", {
    enumerable: true,
    get: ()=>AuthMiddleware
});
const _user = require("../util/User");
const AuthMiddleware = async (req, res, next)=>{
    const token = req.headers['authorization'];
    if (!token) {
        return res.status(401).json({
            message: 'No token provided'
        });
    }
    try {
        const decoded = await _user.UserUtil.VerifyToken(token);
        if (decoded instanceof Error) {
            return res.status(401).json({
                message: decoded.message
            });
        }
        res.locals.userId = decoded;
        return next();
    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
};
