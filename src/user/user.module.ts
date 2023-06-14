import {
	DynamicModule,
	MiddlewareConsumer,
	Module,
	NestModule,
	RequestMethod,
} from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../model/User';
import { AuthenticationModule } from '../Authentication/authentication.module';
import { AuthenticationService } from 'src/Authentication/authentication.service';
import { AuthenticationMiddleware } from 'src/Authentication/authentication.middleware';
import { UserAuthController } from './user.auth.controller';
import { Prisma } from '@prisma/client';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
	controllers: [UserController, UserAuthController],
	providers: [UserService],
	imports: [
		AuthenticationModule.GetAuthUtil(),
		PrismaModule,
	],
	exports: [
		UserService,
	],
})
export class UserModule implements NestModule {
	constructor(private readonly authService: AuthenticationService) {}
	configure(consumer: MiddlewareConsumer) {
		const authMiddleware = new AuthenticationMiddleware(this.authService);
		consumer
			.apply(authMiddleware.use.bind(authMiddleware))
			.forRoutes(UserAuthController);
	}
	static GetUserModule(): DynamicModule {
		return {
			module: UserModule,
			providers: [UserService],
			imports: [
				
				AuthenticationModule.GetAuthUtil(),
			],
			exports: [
				UserService,
			],
		};
	}
}
