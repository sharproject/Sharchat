import { DynamicModule, Module } from '@nestjs/common';
import { RoleService } from './role.service';
import { RoleController } from './role.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Role, RoleSchema } from '../model/Role';

@Module({
    providers: [RoleService],
    controllers: [RoleController],
    imports: [
        MongooseModule.forFeature([
            {
                name: Role.name,
                schema: RoleSchema,
            },
        ]),
    ],
    exports: [RoleService],
})
export class RoleModule {
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
