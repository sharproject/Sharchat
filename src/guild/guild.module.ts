import {
	DynamicModule,
	MiddlewareConsumer,
	Module,
	NestModule,
} from '@nestjs/common';
import { GuildService } from './guild.service';
import { GuildController } from './guild.controller';
import { AuthenticationModule } from '../Authentication/authentication.module';
import { AuthenticationMiddleware } from '../Authentication/authentication.middleware';
import { AuthenticationService } from '../Authentication/authentication.service';
import { MemberModule } from '../member/member.module';
import { RoleModule } from '../role/role.module';
import { UserModule } from '..user.auth.controller.spec';
import { GuildNotAuthController } from './guild.not_auth.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
	imports: [
		AuthenticationModule.GetAuthUtil(),
		MemberModule.GetMemberModel(),
		RoleModule.GetRoleModule(),
		UserModule.GetUserModule(),
		PrismaModule,
	],
	exports: [GuildService],
	providers: [GuildService],
	controllers: [GuildController, GuildNotAuthController],
})
export class GuildModule implements NestModule {
	constructor(private readonly authService: AuthenticationService) {}
	configure(consumer: MiddlewareConsumer) {
		const authMiddlerware = new AuthenticationMiddleware(this.authService);
		consumer
			.apply(authMiddlerware.use.bind(authMiddlerware))
			.forRoutes(GuildController);
	}
	static GetGuildUtil(): DynamicModule {
		return {
			module: GuildModule,
			imports: [
				AuthenticationModule.GetAuthUtil(),
				MemberModule.GetMemberModel(),
				RoleModule.GetRoleModule(),
				UserModule.GetUserModule(),
				PrismaModule,
			],
			exports: [GuildService],
			providers: [GuildService],
		};
	}
}
