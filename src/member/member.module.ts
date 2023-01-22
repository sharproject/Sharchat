import {
    DynamicModule,
    MiddlewareConsumer,
    Module,
    NestModule,
} from '@nestjs/common';
import { MemberService } from './member.service';
import { MemberController } from './member.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Member, MemberModel, MemberSchema } from '../model/Member';
import { UserModule } from '../user/user.module';
import { GuildModule } from '../guild/guild.module';
import { Guild, GuildSchema } from '../model/Guild';
import { RoleModule } from 'src/role/role.module';
import { MemberNotAuthController } from './member.not_auth.controller';
import { AuthenticationMiddleware } from 'src/Authentication/authentication.middleware';
import { AuthenticationModule } from 'src/Authentication/authentication.module';
import { AuthenticationService } from 'src/Authentication/authentication.service';

@Module({
    providers: [MemberService],
    controllers: [MemberController, MemberNotAuthController],
    imports: [
        AuthenticationModule,
        MongooseModule.forFeature([
            {
                name: Member.name,
                schema: MemberSchema,
            },
        ]),
        UserModule.GetUserModule(),
        MongooseModule.forFeature([
            {
                name: Guild.name,
                schema: GuildSchema,
            },
        ]),
        RoleModule.GetRoleModule(),
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
                MongooseModule.forFeature([
                    {
                        name: Member.name,
                        schema: MemberSchema,
                    },
                ]),
                UserModule.GetUserModule(),
                RoleModule.GetRoleModule(),
            ],
            exports: [MemberService],
        };
    }
}
