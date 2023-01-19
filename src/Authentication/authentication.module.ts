import {
    DynamicModule,
    MiddlewareConsumer,
    Module,
    NestModule,
    Provider,
} from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { AuthenticationMiddleware } from './authentication.middleware';
import { SessionSchema, Session } from '../model/Session';
import { MongooseModule } from '@nestjs/mongoose';

export const AUTH_OPTIONS = 'AUTH_OPTIONS';
export interface TAuthOptions {
    isAuth: boolean;
}

const ModuleProvider = [AuthenticationService];
@Module({
    controllers: [],
    providers: [
        {
            provide: AUTH_OPTIONS,
            useValue: { isAuth: true } as TAuthOptions,
        },
        ...ModuleProvider,
    ],
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
    constructor(private AuthService: AuthenticationService) {}
    configure(consumer: MiddlewareConsumer) {
        if (this.AuthService.IsAuth()) {
            let middleware = new AuthenticationMiddleware(this.AuthService);
            consumer.apply(middleware.use.bind(middleware)).forRoutes('*');
        }
    }

    static GetAuthMiddleware(...anotherProvider: Provider[]): DynamicModule {
        return {
            module: AuthenticationModule,
            providers: [
                {
                    provide: AUTH_OPTIONS,
                    useValue: { isAuth: true } as TAuthOptions,
                },
                ...ModuleProvider,
                ...anotherProvider,
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
            providers: [
                {
                    provide: AUTH_OPTIONS,
                    useValue: { isAuth: false } as TAuthOptions,
                },
                ...ModuleProvider,
                ...anotherProvider,
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
