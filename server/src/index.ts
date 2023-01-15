import express from 'express'
import http from 'http'
import {Server} from 'socket.io'
import {
	ClientToServerEvents,
	ServerToClientEvents,
	SocketData,
	HandleEvent,
} from './socket'
import cors from 'cors'
import mongoose from 'mongoose'
import path from 'path'
import dotenv from 'dotenv'
import {DefaultEventsMap} from 'socket.io/dist/typed-events'
import {ControllerDocumentRouterHandler} from './helper/ControllerType'
import {SetupPath} from './router'

dotenv.config({
	path: path.join(__dirname, '..', '.env'),
})

const app = express(); 
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({extended: true}))
const HttpServer = http.createServer(app)
const io = new Server<
	ServerToClientEvents,
	ClientToServerEvents,
	DefaultEventsMap,
	SocketData
>(HttpServer)
new HandleEvent(io)

if (!process.env.DB_URL) {
	throw new Error('DB_URL is not defined')
}

mongoose.connect(process.env.DB_URL, {})


SetupPath(app)

app.get('/routes', (_req, res) => {
	res.json(ControllerDocumentRouterHandler.json())
})

app.disable('x-powered-by');
HttpServer.listen(3000, () => {
	console.log('Server listening on port 3000')
})
