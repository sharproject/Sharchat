import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../model/User';
import { Model } from 'mongoose';
import { RegisterUserInput } from '../typings';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserService {
	constructor(
		private prisma: PrismaService,
	) {}
	async findUserByEmail(
		email: string,
		include?: {
			guilds?: boolean;
			Message?: boolean;
		},
	) {
		return await this.prisma.user.findFirst({
			where: { email: email },
			include,
		});
	}
	async findUserByUsername(
		username: string,
		include?: {
			guilds?: boolean;
			Message?: boolean;
		},
	) {
		return await this.prisma.user.findFirst({
			where: { username: username },
			include,
		});
	}
	async CreateNewUser(
		{ email, password, username }: RegisterUserInput,
		include?: {
			guilds?: boolean;
			Message?: boolean;
		},
	) {
		return await this.prisma.user.create({
			data: {
				email,
				password,
				username,
			},
			include,
		});
	}

	async findUserByID<
		T extends {
			guilds?: boolean;
			Message?: boolean;
		},
	>(id: string, include?: T) {
		return await this.prisma.user.findFirst({
			where: {
				id,
			},
			include: { ...include },
		});
	}
	async DeleteGuildForUser(userID: string, guildId: string) {
		// userID;
		// const a = {
		// 	$pull: {
		// 		guilds: new mongoose.Types.ObjectId(guildId),
		// 	},
		// };
		return await this.prisma.user.update({
			data: {
				guilds: {
					delete: {
						id: guildId,
					},
				},
			},
			where: {
				id: userID,
			},
		});
	}
	async UpdateUserGuild(userID: string, guildId: string) {
		return await this.prisma.user.update({
			data: {
				guilds: {
					connect: {
						id: guildId,
					},
				},
			},
			where: { id: userID },
		});
	}
}
