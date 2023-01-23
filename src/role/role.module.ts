import { DynamicModule, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { RoleService } from './role.service';
import { RoleController } from './role.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Role, RoleSchema } from '../model/Role';
import { AuthenticationMiddleware } from '../Authentication/authentication.middleware';
import { AuthenticationModule } from '../Authentication/authentication.module';
import { AuthenticationService } from '../Authentication/authentication.service';
import { RoleNotAuthController } from './role.not_auth.controller';

@Module({
    providers: [RoleService],
    controllers: [RoleController, RoleNotAuthController],
    imports: [
        AuthenticationModule,
        MongooseModule.forFeature([
            {
                name: Role.name,
                schema: RoleSchema,
            },
        ]),
    ],
    exports: [RoleService],
})
export class RoleModule implements NestModule{
    constructor(private readonly authService:AuthenticationService){}
    configure(consumer: MiddlewareConsumer) {
        let authMiddleware = new AuthenticationMiddleware(this.authService)
        consumer.apply(authMiddleware.use.bind(authMiddleware)).forRoutes(RoleController)
    }
    static GetRoleModule(): DynamicModule {
        return {
            module: RoleModule,
            providers: [RoleService],
            imports: [
                MongooseModule.forFeature([
                    {
                        name: Role.name,
                        schema: RoleSchema,
                    },
                ]),
            ],
            exports: [RoleService],
        };
    }
}
