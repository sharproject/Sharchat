import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateChannelInput } from '../typings/Channel';
import { UserService } from '../user/user.service';
import { RoleService } from '../role/role.service';

@Injectable()
export class ChannelService {
	constructor(
		public readonly prismaService: PrismaService,
		public readonly userService: UserService,
		public readonly roleService: RoleService,
	) {}
	async CreateNewChannel({ name, description, guildID }: CreateChannelInput) {
		return await this.prismaService.channel.create({
			data: {
				name,
				description,
				guildId: guildID,
			},
		});
	}
	async DeleteChannel(id: string) {
		return await this.prismaService.channel.delete({
			where: {
				id,
			},
		});
	}
	async EditChannel(
		input: {
			name: string;
			description: string;
		},
		id: string,
	) {
		return await this.prismaService.channel.update({
			where: { id },
			data: { ...input },
		});
	}
	async findChannelById(id: string) {
		return await this.prismaService.channel.findUnique({
			where: {
				id,
			},
		});
	}
	async updateChannelInfo(
		input: {
			name: string;
			description: string;
		},
		id: string,
	) {
		return await this.prismaService.channel.update({
			where: { id },
			data: { ...input },
		});
	}

	async ListChannelInGuild(guildID: string) {
		return await this.prismaService.channel.findMany({
			where: {
				guildId: guildID,
			},
		});
	}
}
