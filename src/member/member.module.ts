import {
	DynamicModule,
	MiddlewareConsumer,
	Module,
	NestModule,
} from '@nestjs/common';
import { MemberService } from './member.service';
import { MemberController } from './member.controller';
import { UserModule } from '../user/user.module';
import { MemberNotAuthController } from './member.not_auth.controller';
import { AuthenticationMiddleware } from '../Authentication/authentication.middleware';
import { AuthenticationModule } from '../Authentication/authentication.module';
import { AuthenticationService } from '../Authentication/authentication.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
	providers: [MemberService],
	controllers: [MemberController, MemberNotAuthController],
	imports: [AuthenticationModule, UserModule.GetUserModule(), PrismaModule],
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
			imports: [UserModule.GetUserModule(), PrismaModule],
			exports: [MemberService],
		};
	}
}
