import { Injectable } from '@nestjs/common';
import { RegisterUserInput } from '../typings';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserService {
	constructor(private prisma: PrismaService) {}
	async findUserByEmail(email: string) {
		return await this.prisma.user.findFirst({
			where: { email: email },
			include: {
				guilds: true,
			},
		});
	}
	async findUserByUsername(username: string) {
		return await this.prisma.user.findFirst({
			where: { username: username },
			include: {
				guilds: true,
			},
		});
	}
	async CreateNewUser({ email, password, username }: RegisterUserInput) {
		return await this.prisma.user.create({
			data: {
				email,
				password,
				username,
			},
			include: {
				guilds: true,
			},
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
					disconnect: {
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
