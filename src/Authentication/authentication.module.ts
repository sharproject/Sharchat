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
	constructor(private _authService: AuthenticationService) {}
	configure(_consumer: MiddlewareConsumer) {}

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
