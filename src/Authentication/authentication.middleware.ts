import { Injectable, NestMiddleware } from '@nestjs/common';
import {} from '@nestjs/swagger';
import { NextFunction, Request, Response } from 'express';
import { UnAuthentication } from 'src/typings/Error';
import { AuthenticationService } from './authentication.service';

@Injectable()
export class AuthenticationMiddleware implements NestMiddleware {
	constructor(private readonly AuthService: AuthenticationService) {}

	async use(req: Request, res: Response<UnAuthentication>, next: NextFunction) {
		const token = req.headers['authorization'] || req.cookies['authorization'];
		if (!token) {
			return res.status(401).json({
				message: 'No token provided',
			});
		}
		try {
			const decoded = await this.AuthService.VerifyToken(token);
			if (decoded instanceof Error) {
				res.clearCookie('authorization');
				return res.status(401).json({
					message: decoded.message,
				});
			}
			res.locals.userId = decoded;
			return next();
		} catch (error) {
			return res.status(500).json({
				message: error.message,
			});
		}
	}
}
