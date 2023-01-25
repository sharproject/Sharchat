import { Controller } from '@nestjs/common';
import { RoleService } from './role.service';
import { ApiTags } from '@nestjs/swagger';
import { NotAuthTag } from '../constant';

@ApiTags("role",NotAuthTag)
@Controller('role/not-auth')
export class RoleNotAuthController {
	constructor(private readonly roleService: RoleService) {}
}
