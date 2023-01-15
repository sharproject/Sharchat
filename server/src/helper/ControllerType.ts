/* eslint-disable no-mixed-spaces-and-tabs */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {NextFunction, Request} from 'express'
import {Response} from '../typings/ResponseInput'
import {Router} from 'express'

export interface ControllerInformation {
	RequestBody?: {
		[key: string]:
			| any
			| {
					optional?: boolean
					type?: any
			  }
	}
	RequestQuery?: {
		[key: string]:
			| any
			| {
					optional?: boolean
					type?: any
			  }
	}
	// will not use if that is middleware recommend fill it empty
	ControllerName: string
	RequestMethod?: 'get' | 'post' | 'put' | 'delete' | 'patch'
}

export interface ControllerType<auth = false, TResponse = unknown>
	extends ControllerInformation {
	(req: Request, res: Response<auth, TResponse>, next: NextFunction):
		| Promise<unknown>
		| unknown
		| void
		| Promise<void>
		| any

	Middleware?: TControllerMiddlewareFn[]
}

export type TControllerMiddlewareFn<auth = false, TResponse = unknown> = ((
	req: Request,
	res: Response<auth, TResponse>,
	next: NextFunction
) => any) & {
	MiddlewareName?: string
	description?: string
}
interface ControllerDocumentJsonReturnType {
	api: {
		[key: string]: any[]
	}
}
export class ControllerDocument {
	constructor(
		public controller: {
			name: string
			controller: Controller
		}[]
	) {}
	json() {
		let result = {api: {}} as ControllerDocumentJsonReturnType
		for (let c of this.controller) {
			// group
			let controllerJson = {} as any
			for (let con of c.controller.controller) {
				controllerJson[con.ControllerName] = con
			}
			result.api[c.name] = controllerJson
		}
		return result
	}
}

export var ControllerDocumentRouterHandler = new ControllerDocument([])

export class Controller {
	controllers: Map<string, ControllerType>
	allMiddleware: TControllerMiddlewareFn[]
	constructor(
		public controller: ControllerType[],
		public root_path: string,
		public subController: Controller[] = []
	) {
		this.controllers = new Map<string, ControllerType>()
		this.allMiddleware = []
		for (const c of controller) {
			this.controllers.set(c.ControllerName, c)
		}
	}
	SetupRouter(router: Router) {
		for (const [name, controller] of this.controllers) {
			router[controller.RequestMethod || 'post'](
				name.startsWith('/') ? name : `/${name}`,
				...this.allMiddleware,
				...(controller.Middleware ? controller.Middleware : []),
				this.checkRequestBody.bind(this),
				this.checkRequestQuery.bind(this),
				controller
			)
		}
		for (let c of this.subController) {
			c.root_path =
				this.root_path +
				(c.root_path.startsWith('/') ? c.root_path : '/' + c.root_path)
			let n_router = Router()
			c.SetupRouter(n_router)
			router.use(n_router)
		}
		ControllerDocumentRouterHandler.controller.push({
			name: this.root_path,
			controller: this,
		})
	}
	checkRequestBody(req: Request, res: Response<false>, next: NextFunction) {
		req.url = req.protocol + '://' + req.get('host') + req.originalUrl
		const controller = this.controllers.get(
			new URL(req.url).pathname.split('/')[2]
		)
		if (!controller) {
			res.status(400).json({
				message: 'Controller not found',
			})
			return
		}
		if (controller.RequestBody) {
			const RequestBody: {
				[key: string]: any
			} = {}
			for (const key in controller.RequestBody) {
				if (!req.body[key] && !controller.RequestBody[key].optional) {
					res.status(400).json({
						message: 'Missing required fields',
					})

					return
				}

				if (
					!checkType(controller.RequestBody[key], req.body[key]) &&
					!controller.RequestBody[key].optional
				) {
					res.status(400).json({
						message: 'Missing required fields',
					})
					return
				}
				RequestBody[key] = req.body[key]
			}
			req.body = RequestBody
		}
		next()
	}
	checkRequestQuery(req: Request, res: Response<false>, next: NextFunction) {
		req.url = req.protocol + '://' + req.get('host') + req.originalUrl
		const controller = this.controllers.get(
			new URL(req.url).pathname.split('/')[2]
		)
		if (!controller) {
			res.status(400).json({
				message: 'Controller not found',
			})
			return
		}
		if (controller.RequestQuery) {
			for (const key in controller.RequestQuery) {
				if (!req.query[key]) {
					res.status(400).json({
						message: 'Missing required fields',
					})

					return
				}
				if (!checkType(controller.RequestQuery[key], req.query[key])) {
					res.status(400).json({
						message: 'Missing required fields',
					})
					return
				}
			}
		}
		next()
	}
	SetupForRootApp(path: string, app: import('express').Express) {
		this.root_path = path
		let router = Router()
		this.SetupRouter(router)
		app.use(path, router)
		return router
	}
	SetMiddleware(allMiddleware: TControllerMiddlewareFn[]) {
		this.allMiddleware = allMiddleware
		return this
	}
	SetSubController(subController: Controller[]) {
		this.subController = subController
		return this
	}
}

function checkType(type: 'array' | 'number' | 'string' | 'object', value: any) {
	if (type == 'array') return Array.isArray(value)
	return typeof value == type
}
