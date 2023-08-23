import {
	Controller,
	Post,
	Body,
	Param,
	Delete,
	HttpStatus,
	Res,
	HttpException,
	Patch,
	Get,
} from '@nestjs/common';
import { ChannelService } from './channel.service';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthTag } from 'src/constant';
import {
	CreateChannelInput,
	CreateChannelResponse,
	DeleteChannelInput,
	DeleteChannelResponse,
	EditChannelInput,
	EditChannelResponse,
} from 'src/typings/Channel';
import { Response } from 'express';
import { ChannelEntity } from '../model/Channel';

@ApiTags('channel', AuthTag)
@Controller('channel')
export class ChannelController {
	constructor(private readonly channelService: ChannelService) {}

	@ApiResponse({
		status: HttpStatus.CREATED,
		type: CreateChannelResponse,
	})
	@Post('/create')
	async CreateChannel(
		@Body() input: CreateChannelInput,
	): Promise<CreateChannelResponse> {
		const { name } = input;
		const guildID = input.guildID;
		if (!name || !guildID) {
			throw new HttpException(
				{
					message: 'Missing required fields',
				},
				HttpStatus.BAD_REQUEST,
			);
		}
		const description = input.description && '';

		const channel = await this.channelService.CreateNewChannel({
			name,
			description,guildID:guildID
		});
		const returnChannel = await this.channelService.findChannelById(channel.id);
		if (!returnChannel)
			throw new HttpException(
				{
					message: 'Server error',
				},
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		return {
			message: 'Channel created',
			channel: returnChannel,
		};
	}

	@ApiResponse({
		status: HttpStatus.OK,
		type: DeleteChannelResponse,
	})
	@Delete('delete')
	async DeleteChannel(
		@Body() input: DeleteChannelInput,
	): Promise<DeleteChannelResponse> {
		const { id } = input;

		const channel = await this.channelService.findChannelById(id);
		if (!channel) {
			throw new HttpException(
				{
					message: 'Channel not found',
				},
				HttpStatus.BAD_REQUEST,
			);
		}
		await this.channelService.DeleteChannel(channel.id);
		return {
			message: 'Channel deleted',
			channel,
		};
	}

	@ApiResponse({
		status: HttpStatus.OK,
		type: EditChannelResponse,
	})
	@Patch('/edit')
	async EditChannel(
		@Body() input: EditChannelInput,
	): Promise<EditChannelResponse> {
		const { id, name, description } = input;
		if (!id) {
			throw new HttpException(
				{
					message: 'Missing required fields',
				},
				HttpStatus.BAD_REQUEST,
			);
		}
		const channel = await this.channelService.findChannelById(id);
		if (!channel) {
			throw new HttpException(
				{
					message: 'Channel not found',
				},
				HttpStatus.NOT_FOUND,
			);
		}
		if (
			(name && typeof name == 'string') ||
			(description && typeof description == 'string')
		) {
			const updateData = {
				name: channel.name,
				description: channel.description,
			};
			if (name && typeof name == 'string') updateData.name = name;
			if (description && typeof description == 'string')
				updateData.description = description;
			await this.channelService.updateChannelInfo(updateData, channel.id);
		}

		const returnChannel = await this.channelService.findChannelById(channel.id);
		if (!returnChannel)
			throw new HttpException(
				{
					message: 'Server error',
				},
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		return {
			message: 'Channel edited',
			channel: returnChannel,
		};
	}

	@ApiResponse({
		status: HttpStatus.CREATED,
		type: [CreateChannelResponse],
	})
	@Get('/:guild')
	async ListChannelInGuild(
		@Param() guildID: string,
		@Res() res: Response,
	): Promise<ChannelEntity[]> {
		const allChannel = await this.channelService.ListChannelInGuild(guildID);
		const currentUser = await this.channelService.userService.findUserByID(
			String(res.locals.userId),
		);
		if (!currentUser) {
			throw new HttpException(
				{
					message: 'user not found',
				},
				HttpStatus.BAD_REQUEST,
			);
		}
		const memberPermission =
			await this.channelService.roleService.getMemberPermission(
				guildID,
				currentUser.id,
			);
		if (!memberPermission) {
			throw new HttpException(
				{
					message: 'member not found',
				},
				HttpStatus.BAD_REQUEST,
			);
		}
		return allChannel.filter((v) =>
			memberPermission.permissions.canSeeChannel(v.id),
		);
	}
}
