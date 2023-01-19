import {
    DynamicModule,
    MiddlewareConsumer,
    Module,
    NestModule,
    Provider,
} from '@nestjs/common';
import {
    AuthenticationService,
    AuthenticationServiceMiddleware,
} from './authentication.service';
import { AuthenticationMiddleware } from './authentication.middleware';
import { SessionSchema, Session } from '../model/Session';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
    controllers: [],
    providers: [AuthenticationService],
    imports: [
        MongooseModule.forFeature([
            {
                name: Session.name,
                schema: SessionSchema,
            },
        ]),
    ],
    exports: [
        MongooseModule.forFeature([
            {
                name: Session.name,
                schema: SessionSchema,
            },
        ]),
        AuthenticationService,
    ],
})
export class AuthenticationModule implements NestModule {
    constructor(private authService: AuthenticationService) {}
    configure(consumer: MiddlewareConsumer) {
        if (this.authService.IsAuth()) {
            let middleware = new AuthenticationMiddleware(this.authService);
            consumer.apply(middleware.use.bind(middleware)).forRoutes('*');
        }
    }

    static GetAuthMiddleware(...anotherProvider: Provider[]): DynamicModule {
        return {
            module: AuthenticationModule,
            providers: [AuthenticationServiceMiddleware, ...anotherProvider],
            exports: [
                MongooseModule.forFeature([
                    {
                        name: Session.name,
                        schema: SessionSchema,
                    },
                ]),
                AuthenticationService,
            ],
            imports: [
                MongooseModule.forFeature([
                    {
                        name: Session.name,
                        schema: SessionSchema,
                    },
                ]),
            ],
        };
    }

    static GetAuthUtil(...anotherProvider: Provider[]): DynamicModule {
        return {
            module: AuthenticationModule,
            providers: [AuthenticationService, ...anotherProvider],
            exports: [
                MongooseModule.forFeature([
                    {
                        name: Session.name,
                        schema: SessionSchema,
                    },
                ]),
                AuthenticationService,
            ],
            imports: [
                MongooseModule.forFeature([
                    {
                        name: Session.name,
                        schema: SessionSchema,
                    },
                ]),
            ],
        };
    }
}
