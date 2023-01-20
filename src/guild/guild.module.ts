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
import { Guild, GuildSchema } from 'src/model/Guild';
import { MemberModule } from '../member/member.module';
import { RoleModule } from '../role/role.module';
import { UserModule } from 'src/user/user.module';

@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: Guild.name,
                schema: GuildSchema,
            },
        ]),
        AuthenticationModule.GetAuthUtil(),
        MemberModule.GetMemberModel(),
        RoleModule.GetRoleModule(),
        UserModule.GetUserModule(),
    ],
    exports: [GuildService],
    providers: [GuildService],
    controllers: [GuildController],
})
export class GuildModule implements NestModule {
    constructor(private readonly authService: AuthenticationService) {}
    configure(consumer: MiddlewareConsumer) {
        let authMiddlerware = new AuthenticationMiddleware(this.authService);
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
                        name: Guild.name,
                        schema: GuildSchema,
                    },
                ]),
                AuthenticationModule.GetAuthUtil(),
                MemberModule.GetMemberModel(),
                RoleModule.GetRoleModule(),
            ],
            exports: [GuildService],
            providers: [GuildService],
        };
    }
}
