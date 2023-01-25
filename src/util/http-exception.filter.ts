import {
	ExceptionFilter,
	Catch,
	ArgumentsHost,
	HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
	catch(exception: HttpException, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse<Response>();
		const request = ctx.getRequest<Request>();
		const status = exception.getStatus();
		const message = exception.getResponse();
		const responseData = {
			...(typeof message == 'string' ? { message: message } : message),
			timestamp: new Date().toISOString(),
			path: request.url,
		} as { [key: string]: any };
		if (!Object.keys(responseData).some((k) => k == 'statusCode')) {
			responseData['statusCode'] = status;
		}
		response.status(status).json(responseData);
	}
}
