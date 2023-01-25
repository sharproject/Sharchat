import { Controller, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RoleService } from './role.service';
import { AuthTag } from '../constant';
import { Body } from '@nestjs/common/decorators';
import { CreateRoleInput } from '../typings';

@ApiTags('role', AuthTag)
@ApiBearerAuth()
@Controller('role')
export class RoleController {
	constructor(private readonly roleService: RoleService) {}

	@Post('/create')
	async CreateNewRole(@Body() input: CreateRoleInput) {
		
	}
}
