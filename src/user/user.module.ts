import {
	DynamicModule,
	MiddlewareConsumer,
	Module,
	NestModule,
} from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { AuthenticationModule } from '../Authentication/authentication.module';
import { AuthenticationService } from '../Authentication/authentication.service';
import { AuthenticationMiddleware } from '../Authentication/authentication.middleware';
import { UserAuthController } from './user.auth.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
	controllers: [UserController, UserAuthController],
	providers: [UserService],
	imports: [AuthenticationModule.GetAuthUtil(), PrismaModule],
	exports: [UserService],
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
			imports: [AuthenticationModule.GetAuthUtil(), PrismaModule],
			exports: [UserService],
		};
	}
}
