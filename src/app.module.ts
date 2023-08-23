import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';
import { GuildModule } from './guild/guild.module';
import { MemberModule } from './member/member.module';
import { RoleModule } from './role/role.module';
import { PrismaModule } from './prisma/prisma.module';
import { ChannelModule } from './channel/channel.module';
import { RedisModule } from './redis/redis.module';

@Module({
	imports: [
		ConfigModule.forRoot({
			envFilePath: join(__dirname, '..', '.env'),
			isGlobal: true,
		}),
		MongooseModule.forRoot(process.env.MONGO_DB_URL || ''),
		UserModule,
		GuildModule,
		MemberModule,
		RoleModule,
		ChannelModule,
		PrismaModule,
		RedisModule,
	],
	controllers: [],
	providers: [],
})
export class AppModule {}
