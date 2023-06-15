import { IsNotEmpty, IsOptional } from 'class-validator';
import { GuildService } from './guild.service';
import { Response } from 'express';
import {
	Body,
	Controller,
	Delete,
	HttpException,
	HttpStatus,
	Patch,
	Post,
	Res,
} from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
	CreateGuildInput,
	CreateGuildResponse,
	DeleteGuildInput,
	DeleteGuildResponse,
	EditGuildInput,
	EditGuildResponse,
} from '../typings/Guild';
import { AuthTag } from '../constant';

@ApiTags('guild', AuthTag)
@ApiBearerAuth()
@Controller('guild')
export class GuildController {
	constructor(private readonly guildService: GuildService) {}

	@ApiResponse({
		status: HttpStatus.CREATED,
		type: CreateGuildResponse,
	})
	@Post('/create')
	async CreateGuild(
		@Body() input: CreateGuildInput,
		@Res({ passthrough: true }) res: Response,
	): Promise<CreateGuildResponse> {
		const { name } = input;
		if (!name) {
			throw new HttpException(
				{
					message: 'Missing required fields',
				},
				HttpStatus.BAD_REQUEST,
			);
		}
		const description = input.description && '';

		const guild = await this.guildService.CreateNewGuildForRoute(
			{
				name,
				description,
			},
			res.locals.userId,
		);
		const EveryOneRole =
			await this.guildService.OnlyThisModule_CreateDefaultRoleForGuild(
				guild._id,
			);
		guild.everyoneRole = EveryOneRole;
		guild.role.push(EveryOneRole);
		await guild.save();
		const member = await this.guildService.OnlyThisModule_CreateMember(
			guild._id,
			res.locals.userId,
			{
				isOwner: true,
			},
		);
		res.status(HttpStatus.CREATED);
		return {
			message: 'Guild created',
			guild: await guild.save(),
			member,
		};
	}

	@ApiResponse({
		status: HttpStatus.OK,
		type: DeleteGuildResponse,
	})
	@Delete('delete')
	async DeleteGuild(
		@Body() input: DeleteGuildInput,
		@Res({ passthrough: true }) res: Response,
	): Promise<DeleteGuildResponse> {
		const { id } = input;

		const guild = await this.guildService.findGuildById(id);
		if (!guild) {
			throw new HttpException(
				{
					message: 'Guild not found',
				},
				HttpStatus.BAD_REQUEST,
			);
		}
		const result =
			await this.guildService.memberService.MemberUtilCheckPermission(
				res.locals.userId,
				guild._id,
			);
		if (!result) {
			throw new HttpException(
				{
					message: 'Requested user is not in the guild',
				},
				HttpStatus.FORBIDDEN,
			);
		}
		if (!result.isOwner) {
			throw new HttpException(
				{
					message: 'Requested user is not the guild owner',
				},
				HttpStatus.FORBIDDEN,
			);
		}

		try {
			for (const member of guild.members) {
				this.guildService.memberService.MemberUtilDeleteMember(
					member.guild._id,
					member.user._id,
					true,
					true,
				);
			}
		} catch (err) {
			console.log(err);
		}

		try {
			await this.guildService.roleService.deleteAllGuildRole(guild._id);
		} catch (err) {
			console.log(err);
		}
		await this.guildService.userService.DeleteGuildForUser(
			res.locals.userId,
			guild._id,
		);
		await guild.delete();
		return {
			message: 'Guild deleted',
			guild,
		};
	}

	@ApiResponse({
		status: HttpStatus.OK,
		type: EditGuildResponse,
	})
	@Patch('/edit')
	async EditGuild(
		@Body() input: EditGuildInput,
		@Res() res: Response,
	): Promise<EditGuildResponse> {
		const { id, name, description } = input;
		if (!id) {
			throw new HttpException(
				{
					message: 'Missing required fields',
				},
				HttpStatus.BAD_REQUEST,
			);
		}

		const guild = await this.guildService.findGuildById(id);
		if (!guild) {
			throw new HttpException(
				{
					message: 'Guild not found',
				},
				HttpStatus.NOT_FOUND,
			);
		}
		const result =
			await this.guildService.memberService.MemberUtilCheckPermission(
				res.locals.userId,
				guild._id,
			);
		if (!result) {
			throw new HttpException(
				{
					message: 'Requested user is not in the guild',
				},
				HttpStatus.FORBIDDEN,
			);
		}
		if (!result.permissions.canEditGuild()) {
			throw new HttpException(
				{
					message: "Requested member doesn't have permission to edit",
				},
				HttpStatus.FORBIDDEN,
			);
		}

		if (
			(name && typeof name == 'string') ||
			(description && typeof description == 'string')
		) {
			if (name && typeof name == 'string') guild.name = name;
			if (description && typeof description == 'string')
				guild.description = description;

			await guild.save();
		}

		return {
			message: 'Guild edited',
			guild,
		};
	}
}
