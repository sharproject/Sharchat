import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SessionDocument } from '../model/Session';
import * as jsonwebtoken from 'jsonwebtoken';
import { UserService } from '../user/user.service';
import { Session } from '../model/Session';
import { AUTH_OPTIONS, TAuthOptions } from './authentication.module';
interface JwtPayload {
    sessionId: string;
}
@Injectable()
export class AuthenticationService {
    constructor(
        @InjectModel(Session.name) private SessionModel: Model<SessionDocument>,
        @Inject(AUTH_OPTIONS) private options: TAuthOptions = { isAuth: false },
    ) {}
    async GenToken(userId: string) {
        const jwtSecret = process.env.JWT_SECRET;

        if (!jwtSecret) {
            throw new Error('JWT_SECRET is not defined');
        }
        await this.SessionModel.deleteMany({
            UserId: userId,
        });
        const Session = await new this.SessionModel({
            UserId: userId,
        }).save();
        await Session.save();
        const payload: JwtPayload = {
            sessionId: Session._id,
        };
        return jsonwebtoken.sign(payload, jwtSecret, { expiresIn: '1d' });
    }
    async VerifyToken(token: string) {
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            throw new Error('JWT_SECRET is not defined');
        }
        const payload = jsonwebtoken.verify(token, jwtSecret) as JwtPayload;
        if (!payload) {
            return new Error('Invalid token');
        }
        const session = await this.SessionModel.findById(payload.sessionId);
        if (!session) {
            return new Error('Invalid token');
        }
        return session.UserId;
    }
    IsAuth() {
        return this.options.isAuth;
    }
}
