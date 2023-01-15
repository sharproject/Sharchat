"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _express = /*#__PURE__*/ _interopRequireDefault(require("express"));
const _http = /*#__PURE__*/ _interopRequireDefault(require("http"));
const _socketIo = require("socket.io");
const _socket = require("./socket");
const _cors = /*#__PURE__*/ _interopRequireDefault(require("cors"));
const _mongoose = /*#__PURE__*/ _interopRequireDefault(require("mongoose"));
const _path = /*#__PURE__*/ _interopRequireDefault(require("path"));
const _dotenv = /*#__PURE__*/ _interopRequireDefault(require("dotenv"));
const _controllerType = require("./helper/ControllerType");
const _router = require("./router");
function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
_dotenv.default.config({
    path: _path.default.join(__dirname, '..', '.env')
});
const app = (0, _express.default)();
app.use((0, _cors.default)());
app.use(_express.default.json());
app.use(_express.default.urlencoded({
    extended: true
}));
const HttpServer = _http.default.createServer(app);
const io = new _socketIo.Server(HttpServer);
new _socket.HandleEvent(io);
if (!process.env.DB_URL) {
    throw new Error('DB_URL is not defined');
}
_mongoose.default.connect(process.env.DB_URL, {});
(0, _router.SetupPath)(app);
app.get('/hello', (_req, res)=>{
    console.dir(_controllerType.ControllerDocumentRouterHandler.json());
    res.send('hello');
});
HttpServer.listen(3000, ()=>{
    console.log('Server listening on port 3000');
});
