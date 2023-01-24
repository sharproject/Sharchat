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

@Module({
	controllers: [UserController, UserAuthController],
	providers: [UserService],
	imports: [
		MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
		AuthenticationModule.GetAuthUtil(),
	],
	exports: [
		MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
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
				MongooseModule.forFeature([
					{ name: User.name, schema: UserSchema },
				]),
				AuthenticationModule.GetAuthUtil(),
			],
			exports: [
				MongooseModule.forFeature([
					{ name: User.name, schema: UserSchema },
				]),
				UserService,
			],
		};
	}
}
