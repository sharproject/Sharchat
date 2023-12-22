import {
	DynamicModule,
	MiddlewareConsumer,
	Module,
	NestModule,
} from '@nestjs/common';
import { ChannelService } from './channel.service';
import { ChannelController } from './channel.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthenticationService } from '../Authentication/authentication.service';
import { AuthenticationModule } from '../Authentication/authentication.module';
import { AuthenticationMiddleware } from '../Authentication/authentication.middleware';
import { UserModule } from '../user/user.module';
import { RoleModule } from '../role/role.module';

@Module({
	imports: [
		ChannelModule,
		AuthenticationModule,
		PrismaModule,
		UserModule,
		RoleModule,
	],
	controllers: [ChannelController],
	providers: [ChannelService],
})
export class ChannelModule implements NestModule {
	constructor(private readonly authService: AuthenticationService) {}
	configure(consumer: MiddlewareConsumer) {
		const authMiddleware = new AuthenticationMiddleware(this.authService);
		consumer
			.apply(authMiddleware.use.bind(authMiddleware))
			.forRoutes(ChannelController);
	}
	static GetChannelModel(): DynamicModule {
		return {
			module: ChannelModule,
			imports: [AuthenticationModule.GetAuthUtil(), PrismaModule],
			exports: [ChannelService],
			providers: [ChannelService],
		};
	}
}
