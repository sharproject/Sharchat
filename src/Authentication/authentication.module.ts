import {
	DynamicModule,
	MiddlewareConsumer,
	Module,
	NestModule,
	Provider,
} from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { SessionSchema, Session } from '../model/Session';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
	controllers: [],
	providers: [AuthenticationService],
	imports: [
		MongooseModule.forFeature([
			{
				name: Session.name,
				schema: SessionSchema,
			},
		]),
	],
	exports: [AuthenticationService],
})
export class AuthenticationModule implements NestModule {
	use: any;
	constructor(private _authService: AuthenticationService) {}
	// eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars
	configure(_: MiddlewareConsumer) {}

	static GetAuthUtil(...anotherProvider: Provider[]): DynamicModule {
		return {
			module: AuthenticationModule,
			providers: [AuthenticationService, ...anotherProvider],
			exports: [
				MongooseModule.forFeature([
					{
						name: Session.name,
						schema: SessionSchema,
					},
				]),
				AuthenticationService,
			],
			imports: [
				MongooseModule.forFeature([
					{
						name: Session.name,
						schema: SessionSchema,
					},
				]),
			],
		};
	}
}
