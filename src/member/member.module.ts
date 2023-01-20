import { DynamicModule, Module } from '@nestjs/common';
import { MemberService } from './member.service';
import { MemberController } from './member.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Member, MemberModel, MemberSchema } from '../model/Member';
import { UserModule } from '../user/user.module';
import { GuildModule } from '../guild/guild.module';
import { Guild, GuildSchema } from '../model/Guild';
import { RoleModule } from 'src/role/role.module';

@Module({
    providers: [MemberService],
    controllers: [MemberController],
    imports: [
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
export class MemberModule {
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
