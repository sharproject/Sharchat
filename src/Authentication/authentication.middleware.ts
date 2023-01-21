import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { AuthenticationService } from './authentication.service';

@Injectable()
export class AuthenticationMiddleware implements NestMiddleware {
    constructor(private readonly AuthService: AuthenticationService) {}

    async use(req: Request, res: Response, next: NextFunction) {
        const token = req.headers['authorization'];
        if (!token) {
            return res.status(401).json({
                message: 'No token provided',
            });
        }
        try {
            const decoded = await this.AuthService.VerifyToken(token);
            if (decoded instanceof Error) {
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
