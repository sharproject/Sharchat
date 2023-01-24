import {
    Body,
    Controller,
    Delete,
    HttpException,
    HttpStatus,
    Post,
    Res,
} from '@nestjs/common';
import { IsNotEmpty } from 'class-validator';
import { Response } from 'express';
import { MemberService } from './member.service';
import { ApiBearerAuth } from '@nestjs/swagger';

export class JoinGuildInput {
    @IsNotEmpty()
    id: string;
}
export class LeaveGuildInput {
    @IsNotEmpty()
    id: string;
}

@ApiBearerAuth()
@Controller('member')
export class MemberController {
    constructor(private readonly memberService: MemberService) {}
    @Post('/join')
    async JoinGuild(
        @Body() input: JoinGuildInput,
        @Res({ passthrough: true }) res: Response,
    ) {
        const { id } = input;
        if (!id) {
            throw new HttpException(
                {
                    message: 'Missing required fields',
                },
                HttpStatus.BAD_REQUEST,
            );
        }

        try {
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
                guild._id,
            );

            if (member) {
                return {
                    message: 'Requested user already joined the guild',
                    Joined: true,
                };
            }
            const everyoneRole = await this.memberService.findRoleById(
                guild.everyoneRole._id,
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
                guild._id,
                res.locals.userId,
                {
                    isOwner: false,
                },
            );

            return {
                message: 'Joined guild',
                guild,
                member,
            };
        } catch (error) {
            console.log(error);
            throw new HttpException(
                {
                    message: 'Error joining guild',
                },
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
    @Delete('/leave')
    async LeavServer(
        @Body() input: LeaveGuildInput,
        @Res({ passthrough: true }) res: Response,
    ) {
        const id = input.id;
        if (!id) {
            throw new HttpException(
                {
                    message: 'Missing required fields',
                },
                HttpStatus.BAD_REQUEST,
            );
        }

        try {
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
                guild._id,
            );

            if (!member) {
                return {
                    message: "Requested user isn't in the guild",
                };
            }

            if (member.user._id == guild.owner._id) {
                throw new HttpException(
                    {
                        message:
                            "Guild owner can't leave guild, transfer or delete it instead",
                    },
                    HttpStatus.FORBIDDEN,
                );
            }

            member = await this.memberService.MemberUtilDeleteMember(
                guild._id,
                res.locals.userId,
            );

            await guild.update({
                $pull: {
                    members: member._id,
                },
            });
            await guild.save();

            return {
                message: 'Left guild',
                guild,
                member,
            };
        } catch (error) {
            console.log(error);
            throw new HttpException(
                {
                    message: 'Error leaving guild',
                },
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}
