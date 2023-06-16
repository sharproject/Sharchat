import {
	DynamicModule,
	MiddlewareConsumer,
	Module,
	NestModule,
} from '@nestjs/common';
import { RoleService } from './role.service';
import { RoleController } from './role.controller';
import { AuthenticationMiddleware } from '../Authentication/authentication.middleware';
import { AuthenticationModule } from '../Authentication/authentication.module';
import { AuthenticationService } from '../Authentication/authentication.service';
import { RoleNotAuthController } from './role.not_auth.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { MemberModule } from '../member/member.module';

@Module({
	providers: [RoleService],
	controllers: [RoleController, RoleNotAuthController],
	imports: [AuthenticationModule, PrismaModule, MemberModule.GetMemberModel()],
	exports: [RoleService],
})
export class RoleModule implements NestModule {
	constructor(private readonly authService: AuthenticationService) {}
	configure(consumer: MiddlewareConsumer) {
		const authMiddleware = new AuthenticationMiddleware(this.authService);
		consumer
			.apply(authMiddleware.use.bind(authMiddleware))
			.forRoutes(RoleController);
	}
	static GetRoleModule(): DynamicModule {
		return {
			module: RoleModule,
			providers: [RoleService],
			imports: [PrismaModule],
			exports: [RoleService],
		};
	}
}
