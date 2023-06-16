import {
	DynamicModule,
	MiddlewareConsumer,
	Module,
	NestModule,
} from '@nestjs/common';
import { MemberService } from './member.service';
import { MemberController } from './member.controller';
import { UserModule } from '../user/user.module';
import { RoleModule } from 'src/role/role.module';
import { MemberNotAuthController } from './member.not_auth.controller';
import { AuthenticationMiddleware } from 'src/Authentication/authentication.middleware';
import { AuthenticationModule } from 'src/Authentication/authentication.module';
import { AuthenticationService } from 'src/Authentication/authentication.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
	providers: [MemberService],
	controllers: [MemberController, MemberNotAuthController],
	imports: [
		AuthenticationModule,
		UserModule.GetUserModule(),
		RoleModule.GetRoleModule(),
		PrismaModule,
	],
	exports: [MemberService],
})
export class MemberModule implements NestModule {
	constructor(private readonly authService: AuthenticationService) {}
	configure(consumer: MiddlewareConsumer) {
		const authMiddleware = new AuthenticationMiddleware(this.authService);
		consumer
			.apply(authMiddleware.use.bind(authMiddleware))
			.forRoutes(MemberController);
	}
	static GetMemberModel(): DynamicModule {
		return {
			module: MemberModule,
			providers: [MemberService],
			imports: [
				
				UserModule.GetUserModule(),
				RoleModule.GetRoleModule(),
			],
			exports: [MemberService],
		};
	}
}
