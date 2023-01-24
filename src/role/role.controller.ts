import { Controller, Post } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { RoleService } from './role.service';

@ApiBearerAuth()
@Controller('role')
export class RoleController {
	constructor(private readonly roleService: RoleService) {}

	@Post('/create')
	async CreateNewRole() {}
}
