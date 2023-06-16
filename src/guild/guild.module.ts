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
import { AuthenticationService } from 'src/Authentication/authentication.service';
import { MongooseModule } from '@nestjs/mongoose';
import { GuildEntity } from 'src/model/Guild';
import { MemberModule } from '../member/member.module';
import { RoleModule } from '../role/role.module';
import { UserModule } from 'src/user/user.module';
import { GuildNotAuthController } from './guild.not_auth.controller';

@Module({
	imports: [
		MongooseModule.forFeature([
			{
				name: GuildEntity.name,
				schema: GuildEntity,
			},
		]),
		AuthenticationModule.GetAuthUtil(),
		MemberModule.GetMemberModel(),
		RoleModule.GetRoleModule(),
		UserModule.GetUserModule(),
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
				MongooseModule.forFeature([
					{
						name: GuildEntity.name,
						schema: GuildEntity,
					},
				]),
				AuthenticationModule.GetAuthUtil(),
				MemberModule.GetMemberModel(),
				RoleModule.GetRoleModule(),
				UserModule.GetUserModule(),
			],
			exports: [GuildService],
			providers: [GuildService],
		};
	}
}
