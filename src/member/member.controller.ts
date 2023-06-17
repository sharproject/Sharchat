import {
	Body,
	Controller,
	Delete,
	Get,
	HttpException,
	HttpStatus,
	Param,
	Post,
	Res,
} from '@nestjs/common';
import { Response } from 'express';
import { MemberService } from './member.service';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
	JoinGuildInput,
	JoinGuildResponse,
	LeaveGuildInput,
	LeaveGuildResponse,
} from '../typings';
import { AuthTag } from '../constant';
import { MemberEntity } from '../model/Member';

@ApiTags('member', AuthTag)
@ApiBearerAuth()
@Controller('member')
export class MemberController {
	constructor(private readonly memberService: MemberService) {}
	@ApiResponse({
		status: HttpStatus.OK,
		type: JoinGuildResponse,
	})
	@Post('/join')
	async JoinGuild(
		@Body() input: JoinGuildInput,
		@Res({ passthrough: true }) res: Response,
	): Promise<JoinGuildResponse> {
		const { id } = input;
		if (!id) {
			throw new HttpException(
				{
					message: 'Missing required fields',
				},
				HttpStatus.BAD_REQUEST,
			);
		}

		const guild = await this.memberService.findGuildById(id);
		if (!guild) {
			throw new HttpException(
				{
					message: 'Guild not found',
				},
				HttpStatus.BAD_REQUEST,
			);
		}

		let member = await this.memberService.findMemberByUserIdAndGuildId(
			res.locals.userId,
			guild.id,
		);

		if (member && !member.removed) {
			return {
				message: 'Requested user already joined the guild',
				Joined: true,
				guild,
				member,
			};
		} else if (member && member.removed) {
			return {
				message: 'Joined guild',
				Joined: true,
				guild,
				member: await this.memberService.setRemoved(member.id, !member.removed),
			};
		}
		const everyoneRole = await this.memberService.findRoleById(
			guild.everyoneRoleId,
		);
		if (!everyoneRole) {
			throw new HttpException(
				{
					message: 'Server Error',
				},
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		}
		member = await this.memberService.MemberUtilCreateMember(
			guild.id,
			res.locals.userId,
			{
				isOwner: false,
			},
		);
		if (!member) {
			throw new HttpException(
				{
					message: 'INTERNAL SERVER ERROR - to đùng',
				},
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		}
		return {
			message: 'Joined guild',
			Joined: false,
			guild,
			member,
		};
	}

	@ApiResponse({
		status: HttpStatus.OK,
		type: LeaveGuildResponse,
	})
	@Delete('/leave')
	async LeaveServer(
		@Body() input: LeaveGuildInput,
		@Res({ passthrough: true }) res: Response,
	): Promise<LeaveGuildResponse> {
		const id = input.id;
		if (!id) {
			throw new HttpException(
				{
					message: 'Missing required fields',
				},
				HttpStatus.BAD_REQUEST,
			);
		}

		let guild = await this.memberService.findGuildById(id);
		if (!guild) {
			throw new HttpException(
				{
					message: 'Guild not found',
				},
				HttpStatus.BAD_REQUEST,
			);
		}

		let member = await this.memberService.findMemberByUserIdAndGuildId(
			res.locals.userId,
			guild.id,
		);

		if (!member) {
			throw new HttpException(
				{
					message: "Requested user isn't in the guild",
				},
				HttpStatus.FORBIDDEN,
			);
		}

		if (member.userId == guild.ownerID) {
			throw new HttpException(
				{
					message:
						"Guild owner can't leave guild, transfer or delete it instead",
				},
				HttpStatus.FORBIDDEN,
			);
		}

		member = await this.memberService.MemberUtilDeleteMember(
			guild.id,
			res.locals.userId,
		);
		guild = await this.memberService.findGuildById(id);
		if (!guild) {
			throw new HttpException(
				{
					message: 'Guild not found',
				},
				HttpStatus.BAD_REQUEST,
			);
		}
		return {
			message: 'Left guild',
			guild,
			member,
		};
	}

	@Get('/:id')
	@ApiResponse({
		status: HttpStatus.OK,
		type: MemberEntity,
	})
	async GetMemberByID(
		@Param('id') id: string,
		@Res() res: Response,
	): Promise<MemberEntity> {
		/**
		 * find member by id in database call with targetMember
		 * find member by res.local.userId and targetMember.guildId
		 *
		 */
		const targetMember = await this.memberService.findMemberById(id);
		if (!targetMember)
			throw new HttpException(
				{
					message: 'Member not found',
				},
				HttpStatus.NOT_FOUND,
			);
		const requestMember = await this.memberService.findMemberByUserIdAndGuildId(
			res.locals.userId,
			targetMember.guildId,
		);
		if (!requestMember)
			throw new HttpException(
				{
					message: 'Member not found',
				},
				HttpStatus.NOT_FOUND,
			);
		return targetMember;
	}
}
