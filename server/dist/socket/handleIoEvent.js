"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "HandleEvent", {
    enumerable: true,
    get: ()=>HandleEvent
});
const _user = require("../util/User");
class HandleEvent {
    AddEvent() {
        this.socket.on('connection', (socket)=>{
            console.log('new socket connection with id: ' + socket.id);
            socket.on('disconnect', ()=>{
                console.log('socket disconnected with id: ' + socket.id);
            });
        });
    }
    SetupMiddleware() {
        this.socket.use(async (socket, next)=>{
            const token = socket.handshake.auth.token;
            if (!token) {
                return next(new Error('Authentication error'));
            }
            const userId = await _user.UserUtil.VerifyToken(token);
            if (!userId) {
                return next(new Error('Authentication error'));
            }
            if (userId instanceof Error) {
                return next(userId);
            }
            socket.data.UserId = userId;
        });
    }
    constructor(socket){
        this.socket = socket;
        this.AddEvent();
    }
}
