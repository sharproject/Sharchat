"use strict";
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
    RegisterUser: ()=>RegisterUser,
    LoginUser: ()=>LoginUser,
    UserController: ()=>UserController
});
const _user = require("../model/User");
const _bcrypt = /*#__PURE__*/ _interopRequireDefault(require("bcrypt"));
const _user1 = require("../util/User");
const _controllerType = require("../helper/ControllerType");
function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const RegisterUser = async (req, res)=>{
    const { email , password , username  } = req.body;
    if (!email || !password || !username) {
        return res.status(400).json({
            message: 'Please fill all the fields'
        });
    }
    try {
        const alreadyUser = await _user.UserModel.findOne({
            email: email
        }) || await _user.UserModel.findOne({
            username: username
        });
        if (alreadyUser) {
            return res.status(400).json({
                message: 'Username or email is already taken'
            });
        }
        const hashPassword = await _bcrypt.default.hash(password, 10);
        const user = new _user.UserModel({
            email,
            password: hashPassword,
            username
        });
        await user.save();
        return res.status(201).json({
            message: 'User created successfully',
            token: await _user1.UserUtil.GenToken(user._id)
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
};
RegisterUser.ControllerName = 'register';
RegisterUser.RequestMethod = 'post';
RegisterUser.RequestBody = {
    email: 'string',
    username: 'string',
    password: 'string'
};
const LoginUser = async (req, res)=>{
    const { emailOrUsername , password  } = req.body;
    if (!emailOrUsername || !password) {
        return res.status(400).json({
            message: 'Please fill all the fields'
        });
    }
    try {
        const user = await _user.UserModel.findOne({
            email: emailOrUsername
        }) || await _user.UserModel.findOne({
            username: emailOrUsername
        });
        if (!user) {
            return res.status(400).json({
                message: 'User not found'
            });
        }
        const isMatch = await _bcrypt.default.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({
                message: 'Password is incorrect'
            });
        }
        return res.status(200).json({
            message: 'Login successfully',
            token: await _user1.UserUtil.GenToken(user._id)
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
};
LoginUser.ControllerName = 'login';
LoginUser.RequestMethod = 'post';
LoginUser.RequestBody = {
    emailOrUsername: 'string',
    password: 'string'
};
const UserController = new _controllerType.Controller([
    RegisterUser,
    LoginUser
], "/user");
