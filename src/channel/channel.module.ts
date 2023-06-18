import {
	DynamicModule,
	MiddlewareConsumer,
	Module,
	NestModule,
} from '@nestjs/common';
import { ChannelService } from './channel.service';
import { ChannelController } from './channel.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AuthenticationService } from 'src/Authentication/authentication.service';
import { AuthenticationModule } from 'src/Authentication/authentication.module';
import { AuthenticationMiddleware } from 'src/Authentication/authentication.middleware';
import { UserModule } from 'src/user/user.module';

@Module({
  imports : [
    ChannelModule,
    AuthenticationModule,
    PrismaModule,
    UserModule
  ],
  controllers: [ChannelController],
  providers: [ChannelService]
})
export class ChannelModule implements NestModule{
  constructor(private readonly authService : AuthenticationService) {}
  configure(consumer: MiddlewareConsumer) {
      const authMiddleware = new AuthenticationMiddleware(this.authService);
      consumer
			.apply(authMiddleware.use.bind(authMiddleware))
			.forRoutes(ChannelController);
  }
  static GetChannelModel() : DynamicModule{
    return {
      module : ChannelModule,
      imports : [AuthenticationModule.GetAuthUtil(),PrismaModule],
      exports : [ChannelService],
      providers : [ChannelService],
    };
  }
}
