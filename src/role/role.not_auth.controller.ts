import { Controller } from '@nestjs/common';
import { RoleService } from './role.service';

@Controller('role/not-auth')
export class RoleNotAuthController {
	constructor(private readonly roleService: RoleService) {}
}
