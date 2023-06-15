import { Controller, HttpException, HttpStatus, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RoleService } from './role.service';
import { Response } from 'express';
import { AuthTag } from '../constant';
import { Body, Res } from '@nestjs/common/decorators';
import { CreateRoleInput } from '../typings';
import { everyonePermissionDefault } from '../configuration/permissions';
import { RoleEntity } from '../model/Role';

@ApiTags('role', AuthTag)
@ApiBearerAuth()
@Controller('role')
export class RoleController {
	constructor(private readonly roleService: RoleService) {}

	@Post('/create')
	@ApiResponse({
		status: HttpStatus.OK,
		type: RoleEntity,
	})
	async CreateNewRole(
		@Body() input: CreateRoleInput,
		@Res() res: Response,
	): Promise<RoleEntity> {
		const guild = await this.roleService.findGuildByID(input.guildId);
		if (!guild) {
			throw new HttpException(
				{
					message: 'Guild not found',
				},
				HttpStatus.BAD_REQUEST,
			);
		}
		if (input.position) {
			const roleSamePosition =
				await this.roleService.findRoleInGuildHadSamePosition(
					input.position,
					guild.id,
				);
			if (roleSamePosition) {
				throw new HttpException(
					{
						message: 'role position already in guil',
					},
					HttpStatus.BAD_REQUEST,
				);
			}
		}
		// input.position < user_posittion => allow else block
		const rolePosition =
			input.position ||
			(await this.roleService.findRoleInGuild(guild.id)).length;
		const UserPermission = await this.roleService.getMemberPermission(
			guild.id,
			res.locals.userId,
		);
		if (!UserPermission)
			throw new HttpException(
				{
					message: 'Member not found',
				},
				HttpStatus.BAD_REQUEST,
			);
		if (!UserPermission.permissions.couldCreateRole(rolePosition)) {
			throw new HttpException(
				{
					message: 'You cannot do this action',
				},
				HttpStatus.BAD_REQUEST,
			);
		}
		return await this.roleService.CreateRole({
			RoleName: input.name,
			guildId: input.guildId,
			hideInNav: input.hide,
			color: input.color,
			position: rolePosition,
			permissions: input.permission || everyonePermissionDefault,
		});
	}
}
