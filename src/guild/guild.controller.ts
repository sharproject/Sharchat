import { IsNotEmpty, IsOptional } from 'class-validator';
import { PrismaService } from 'src/prisma/prisma.service';
import { GuildService } from './guild.service';
import { Response } from 'express';
import { GuildModule } from './guild.module';
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
				guild.id,
			);

		this.guildService.prismaService.guild.update({
			where: {
				id: guild.id,
			},
			data: {
				roles: {
					connect: {
						id: EveryOneRole.id,
					},
				},
				everyoneRoleId: EveryOneRole.id,
			},
		});

		const member = await this.guildService.OnlyThisModule_CreateMember(
			guild.id,
			res.locals.userId,
			{
				isOwner: true,
			},
		);
		res.status(HttpStatus.CREATED);
		const returnGuild = await this.guildService.findGuildById(guild.id);
		if (!returnGuild)
			throw new HttpException(
				{
					message: 'Server error',
				},
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		return {
			message: 'Guild created',
			guild: returnGuild,
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

		const guild = await this.guildService.findGuildById(id, {
			members: true,
		});
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
				guild.id,
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
			if (guild.members)
				for (const member of guild.members) {
					this.guildService.memberService.MemberUtilDeleteMember(
						member.guildId,
						member.userId,
						true,
						true,
					);
				}
		} catch (err) {
			console.log(err);
		}

		try {
			await this.guildService.roleService.deleteAllGuildRole(guild.id);
		} catch (err) {
			console.log(err);
		}
		await this.guildService.userService.DeleteGuildForUser(
			res.locals.userId,
			guild.id,
		);
		await this.guildService.DeleteGuild(guild.id);
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
				guild.id,
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
			const updateData = {
				name: guild.name,
				description: guild.description,
			};
			if (name && typeof name == 'string') updateData.name = name;
			if (description && typeof description == 'string')
				updateData.description = description;

			await this.guildService.UpdateGuildInfo(updateData, guild.id);
		}

		const returnGuild = await this.guildService.findGuildById(guild.id);
		if (!returnGuild)
			throw new HttpException(
				{
					message: 'Server error',
				},
				HttpStatus.INTERNAL_SERVER_ERROR,
			);

		return {
			message: 'Guild edited',
			guild: returnGuild,
		};
	}
}
