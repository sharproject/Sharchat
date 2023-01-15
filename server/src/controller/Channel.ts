import {Controller, ControllerType, TControllerMiddlewareFn} from '../helper/ControllerType'
import { AuthMiddleware } from '../middleware/auth'

export const CreateChannel: ControllerType<true> = async (
	_req,
	res,
	_next
) => {
    res.send("hello")
}
CreateChannel.ControllerName = 'create'
CreateChannel.RequestMethod = "get"

export const CreateChannelMiddleware: TControllerMiddlewareFn = async (
	_,
	_r,
	next
) => {
    console.log("middleware")
    next()
}
CreateChannelMiddleware.MiddlewareName = "siuuuuuu"
CreateChannelMiddleware.description = "siuuuuuuuuuu"
CreateChannel.Middleware = []
CreateChannel.Middleware?.push(CreateChannelMiddleware)
export const ChannelController = new Controller([CreateChannel],"/channel").SetMiddleware([AuthMiddleware])
