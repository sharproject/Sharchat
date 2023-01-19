import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';
import { GuildModule } from './guild/guild.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            envFilePath: join(__dirname, '..', '.env'),
            isGlobal: true,
        }),
        UserModule,
        MongooseModule.forRoot(process.env.DB_URL || ''),
        GuildModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}
