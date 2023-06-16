import { Controller, HttpException, HttpStatus, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RoleService } from './role.service';
import { Response } from 'express';
import { AuthTag } from '../constant';
import { Body, Delete, Param, Patch, Res } from '@nestjs/common/decorators';
import { CreateRoleInput, UpdateRoleInput } from '../typings';
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
			permissions: input.permissions || everyonePermissionDefault,
		});
	}

	@Patch('/edit/:id')
	@ApiResponse({
		status: HttpStatus.OK,
		type: RoleEntity,
	})
	async EditRoleInfo(
		@Param('id') id: string,
		@Body() input: UpdateRoleInput,
		@Res() res: Response,
	): Promise<RoleEntity> {
		const targetRole = await this.roleService.findRoleById(id);
		if (!targetRole) {
			throw new HttpException(
				{
					message: 'role not found',
				},
				HttpStatus.NOT_FOUND,
			);
		}
		const changerPermission = await this.roleService.getMemberPermission(
			targetRole.guildId,
			res.locals.userId,
		);
		if (!changerPermission) {
			throw new HttpException(
				{
					message: 'Server Error',
				},
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		}
		if (!changerPermission.permissions.couldEditRole(targetRole.position)) {
			throw new HttpException(
				{
					message: 'your highest role lower than target role',
				},
				HttpStatus.BAD_REQUEST,
			);
		}
		const IsPermissionChangeError = async () => {
			if (input.permissions) {
				/**
				 * should check if
				 * ✅ changer is the owner break
				 * if changer have this role
				 * ❌ if this is the remove role permission action ( query in database and then compare 2 permission (oldTargetRolePermission,newTargetRolePermission))
				 * check role of changer have same permission of remove role if true break // user continute have this permission if remove
				 * if nop throw error like : you couldn't do this action your permission will lost
				 *
				 * ❌ if add new permission (check like remove role permission):
				 * check if changer permission have that permission
				 * else break
				 *
				 * note : could edit PermissionUtilClass thank because read and make this
				 */
				if (changerPermission?.isOwner) {
					return false;
				}
			}
		};
		if (await IsPermissionChangeError()) {
			throw new HttpException(
				{
					message:
						'you cannot do this action your permission will lost or your permission dont enough',
				},
				HttpStatus.BAD_REQUEST,
			);
		}
		return await this.roleService.UpdateRole(id, input);
	}

	@Delete('/delete/:id')
	@ApiResponse({
		status: HttpStatus.OK,
		type: RoleEntity,
	})
	async DeleteRole(
		@Param('id') id: string,
		@Res() res: Response,
	): Promise<RoleEntity> {
		const targetRole = await this.roleService.findRoleById(id);
		if (!targetRole) {
			throw new HttpException(
				{
					message: 'role not found',
				},
				HttpStatus.NOT_FOUND,
			);
		}
		const changerPermission = await this.roleService.getMemberPermission(
			targetRole.guildId,
			res.locals.userId,
		);
		if (!changerPermission) {
			throw new HttpException(
				{
					message: 'Server Error',
				},
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		}
		if (!changerPermission.permissions.couldDeleteRole(targetRole.position)) {
			throw new HttpException(
				{
					message: 'your highest role lower than target role',
				},
				HttpStatus.BAD_REQUEST,
			);
		}

		return await this.roleService.DeleteRole(id);
	}

	@Patch('/add/role/:roleId/:memberId')
	@ApiResponse({
		status: HttpStatus.OK,
		type: RoleEntity,
	})
	async AddRoleForMember(
		@Param('roleId') id: string,
		@Param('memberId') memberID: string,
		@Res() res: Response,
	): Promise<RoleEntity> {
		const targetRole = await this.roleService.findRoleById(id);
		if (!targetRole) {
			throw new HttpException(
				{
					message: 'role not found',
				},
				HttpStatus.NOT_FOUND,
			);
		}
		const targetMember = await this.roleService.findMemberById(memberID);
		if (!targetMember) {
			throw new HttpException(
				{
					message: 'member not found',
				},
				HttpStatus.NOT_FOUND,
			);
		}
		const changerPermission = await this.roleService.getMemberPermission(
			targetRole.guildId,
			res.locals.userId,
		);
		if (!changerPermission) {
			throw new HttpException(
				{
					message: 'Server Error',
				},
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		}
		if (
			!changerPermission.permissions.couldAddOrRemoveRoleForMember(
				targetRole.position,
			)
		) {
			throw new HttpException(
				{
					message: 'your highest role lower than target role',
				},
				HttpStatus.BAD_REQUEST,
			);
		}
		return this.roleService.AddMember(targetMember.id, targetRole.id);
	}

	@Patch('/remove/role/:roleId/:memberId')
	@ApiResponse({
		status: HttpStatus.OK,
		type: RoleEntity,
	})
	async RemoveRoleForMember(
		@Param('roleId') id: string,
		@Param('memberId') memberID: string,
		@Res() res: Response,
	): Promise<RoleEntity> {
		const targetRole = await this.roleService.findRoleById(id);
		if (!targetRole) {
			throw new HttpException(
				{
					message: 'role not found',
				},
				HttpStatus.NOT_FOUND,
			);
		}
		const targetMember = await this.roleService.findMemberById(memberID);
		if (!targetMember) {
			throw new HttpException(
				{
					message: 'member not found',
				},
				HttpStatus.NOT_FOUND,
			);
		}
		const changerPermission = await this.roleService.getMemberPermission(
			targetRole.guildId,
			res.locals.userId,
		);
		if (!changerPermission) {
			throw new HttpException(
				{
					message: 'Server Error',
				},
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		}
		if (
			!changerPermission.permissions.couldAddOrRemoveRoleForMember(
				targetRole.position,
			)
		) {
			throw new HttpException(
				{
					message: 'your highest role lower than target role',
				},
				HttpStatus.BAD_REQUEST,
			);
		}
		return this.roleService.RemoveMember(targetMember.id, targetRole.id);
	}
}
