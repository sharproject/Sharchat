import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { GuildService } from './guild.service';
import { GuildController } from './guild.controller';
import { AuthenticationModule } from '../Authentication/authentication.module';
import { AuthenticationMiddleware } from '../Authentication/authentication.middleware';

@Module({
    imports: [AuthenticationModule.GetAuthMiddleware()],
    providers: [GuildService],
    controllers: [GuildController],
})
export class GuildModule {}
