/* eslint-disable no-mixed-spaces-and-tabs */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {NextFunction, Request} from 'express'
import {Response} from '../typings/ResponseInput'
import {Router} from 'express'

type RequestUserInputValueType =
	| {
			optional?: boolean
			type: 'string' | 'number'
	  }
	| {
			optional?: boolean
			type: 'array'
			childType: RequestDataType | RequestUserInputValueType
	  }
	| {
			optional?: boolean
			type: 'object'
			childType: RequestInput
	  }
	| RequestDataType
interface RequestInput {
	[key: string]: RequestUserInputValueType
}

export interface ControllerInformation {
	RequestBody?: RequestInput
	RequestQuery?: RequestInput
	// will not use if that is middleware recommend fill it empty
	ControllerName: string
	RequestMethod?: 'get' | 'post' | 'put' | 'delete' | 'patch'
	BlockOtherMiddleware?: boolean
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
	MiddlewareName: string
	description?: string
	CustomMiddleware?: string
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
			let controllerJson = {path: {}, middleware: {}} as any
			for (let con of c.controller.controller) {
				let conInfo = {} as any
				for (let k in con) {
					if (k == 'Middleware') {
						let middleware = con[
							k as keyof typeof con
						] as TControllerMiddlewareFn[]
						let middlewareInfo = middleware.map((v) => {
							let result = {} as any
							for (let k in v) {
								result[k] = v[k as keyof typeof v]
							}
							return result
						})
						conInfo[k] = middlewareInfo
					} else {
						conInfo[k] = con[k as keyof typeof con]
					}
				}
				controllerJson['path'][
					con.ControllerName.startsWith('/')
						? con.ControllerName
						: `/${con.ControllerName}`
				] = conInfo
			}
			for (let middleware of c.controller.allMiddleware) {
				let middlewareInfo = {} as any
				for (let k in middleware) {
					middlewareInfo[k] = middleware[k as keyof typeof middleware]
				}

				controllerJson['middleware'][middleware.MiddlewareName] = middlewareInfo
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
				...(controller?.BlockOtherMiddleware == true ? [] : this.allMiddleware),
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
			const [RequestBody, error] = CheckRequestInput(
				controller.RequestBody,
				req.body
			)
			if (error) {
				res.status(error.status).send(error.message)
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
			const [RequestQuery, error] = CheckRequestInput(
				controller.RequestQuery,
				req.query
			)
			if (error) {
				res.status(error.status).send(error.message)
			}
			for (let key in RequestQuery) {
				req.query[key] = String(RequestQuery[key])
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

function checkType(type: RequestDataType, value: any) {
	if (type == 'array') return Array.isArray(value)
	return typeof value == type
}

type RequestDataType = 'array' | 'number' | 'string' | 'object' | 'boolean'

function CheckRequestInput(
	RequestBodyType: RequestInput,
	body: {
		[key: string]: any
	}
): [
	(
		| {
				[key: string]: any
		  }
		| null
		| undefined
	),
	(
		| {
				status: number
				message: string
		  }
		| null
		| undefined
	)
] {
	const RequestBody: {
		[key: string]: any
	} = {}
	for (const key in RequestBodyType) {
		// if (!body[key] && !(RequestBodyType[key] as any).optional) {
		// 	res.status(400).json({
		// 		message: 'Missing required fields',
		// 	})

		// 	return
		// }

		// let tmp = RequestBodyType[key]
		// if (
		// 	!checkType(typeof tmp == 'string' ? tmp : tmp.type, body[key]) &&
		// 	!(tmp as any).optional
		// ) {
		// 	res.status(400).json({
		// 		message: 'Missing required fields',
		// 	})
		// 	return
		// }
		const ItemType = RequestBodyType[key]
		if (
			!body[key] &&
			!(typeof ItemType == 'string' ? false : ItemType.optional)
		) {
			//TODO: return error

			return [
				null,
				{
					status: 400,
					message: 'Missing required fields',
				},
			]
		}

		if (typeof ItemType == 'string') {
			if (!checkType(ItemType, body[key])) {
				//TODO: Return type error
				return [
					null,
					{
						status: 400,
						message: 'Fields types error',
					},
				]
			}
		} else if (ItemType.type == 'array') {
			if (!checkType(ItemType.type, body[key])) {
				//TODO: return type error
				return [
					null,
					{
						status: 400,
						message: 'Fields types error',
					},
				]
			} else if (
				!(body[key] as Array<any>).every((i) => {
					if (i == null || (i == undefined && ItemType.optional)) {
						return true
					}
					return typeof i == ItemType.childType
				})
			) {
				//TODO: return array chill type error
				return [
					null,
					{
						status: 400,
						message: 'Array child type error',
					},
				]
			}
		} else if (ItemType.type == 'object') {
			const [data, error] = CheckRequestInput(ItemType.childType, body[key])
			if (error) {
				return [data, error]
			}
			body[key] = data
		}

		RequestBody[key] = body[key]
	}
	return [RequestBody, null]
}
