import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../model/User';
import { Model } from 'mongoose';
import { IsEmail, IsNotEmpty } from 'class-validator';
import { GuildDocument } from 'src/model/Guild';
import mongoose from 'mongoose';
export class RegisterUserInput {
    @IsEmail()
    @IsNotEmpty()
    email: string;
    @IsNotEmpty()
    password: string;
    @IsNotEmpty()
    username: string;
}

export class LoginUserInput {
    @IsNotEmpty()
    emailOrUsername: string;
    @IsNotEmpty()
    password: string;
}

@Injectable()
export class UserService {
    constructor(
        @InjectModel(User.name) private UserModel: Model<UserDocument>,
    ) {}
    async findUserByEmail(email: string) {
        return await this.UserModel.findOne({ email: email });
    }
    async findUserByUsername(username: string) {
        return await this.UserModel.findOne({ username: username });
    }
    async CreateNewUser({ email, password, username }: RegisterUserInput) {
        return await new this.UserModel({
            email,
            password,
            username,
        }).save();
    }

    async findUserByID(id: string) {
        return await this.UserModel.findById(id);
    }
    async DeleteGuildForUser(userID: string, guildId: string) {
        return await this.UserModel.findByIdAndUpdate(userID, {
            $pull: {
                guilds: new mongoose.Types.ObjectId(guildId),
            },
        });
    }
}