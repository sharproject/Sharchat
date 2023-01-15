"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "UserUtil", {
    enumerable: true,
    get: ()=>UserUtil
});
const _jsonwebtoken = /*#__PURE__*/ _interopRequireDefault(require("jsonwebtoken"));
const _session = require("../model/Session");
const _path = /*#__PURE__*/ _interopRequireDefault(require("path"));
const _dotenv = /*#__PURE__*/ _interopRequireDefault(require("dotenv"));
function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
_dotenv.default.config({
    path: _path.default.join(__dirname, '..', '..', '.env')
});
const jwtSecret = process.env.JWT_SECRET;
const UserUtil = {
    GenToken: async (userId)=>{
        if (!jwtSecret) {
            throw new Error('JWT_SECRET is not defined');
        }
        const Session = new _session.SessionModel({
            UserId: userId
        });
        await Session.save();
        const payload = {
            sessionId: Session._id
        };
        return _jsonwebtoken.default.sign(payload, jwtSecret, {
            expiresIn: '1d'
        });
    },
    VerifyToken: async (token)=>{
        if (!jwtSecret) {
            throw new Error('JWT_SECRET is not defined');
        }
        const payload = _jsonwebtoken.default.verify(token, jwtSecret);
        if (!payload) {
            return new Error('Invalid token');
        }
        const session = await _session.SessionModel.findById(payload.sessionId);
        if (!session) {
            return new Error('Invalid token');
        }
        return session.UserId;
    }
};
