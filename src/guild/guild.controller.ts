import { IsNotEmpty, IsOptional } from 'class-validator';
import { GuildService } from './guild.service';
import { Response } from 'express';
import {
    Body,
    Controller,
    Delete,
    HttpException,
    HttpStatus,
    Post,
    Res,
} from '@nestjs/common';

export class CreateGuildInput {
    @IsNotEmpty()
    name: string;

    @IsOptional()
    description?: string;
}

export class DeleteGuildInput {
    @IsNotEmpty()
    id: string;
}
@Controller('guild')
export class GuildController {
    constructor(private readonly guildService: GuildService) {}
    @Post('/create')
    async CreateGuild(@Body() input: CreateGuildInput, @Res() res: Response) {
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

        try {
            const guild = await this.guildService.CreateNewGuildForRoute(
                {
                    name,
                    description,
                },
                res.locals.userId,
            );

            const member = await this.guildService.OnlyThisModule_CreateMember(
                guild._id,
                res.locals.userId,
                {
                    isOwner: true,
                },
            );

            const EveryOneRole =
                await this.guildService.OnlyThisModule_CreateDefaultRoleForGuild(
                    guild._id,
                );
            guild.everyoneRole = EveryOneRole;
            guild.role.push(EveryOneRole);
            member.Role.push(EveryOneRole);
            guild.members.push(member);
            EveryOneRole.member.push(member);
            await this.guildService.OnlyThisModule_UpdateUserJoinAndCreateGuild(
                guild._id,
                member.user._id,
            );

            await member.save();
            await EveryOneRole.save();
            await guild.save();

            res.status(201).json({
                message: 'Guild created',
                guild,
                member,
            });
        } catch (error) {
            console.log(error);
            res.status(500).json({
                message: 'Error creating guild',
            });
        }
    }

    @Delete('delete')
    async DeleteGuild(@Body() input: DeleteGuildInput, @Res() res: Response) {
        const { id } = input;

        try {
            const guild = await this.guildService.findGuildById(id);
            if (!guild) {
                res.status(400).json({
                    message: 'Guild not found',
                });
                return;
            }
            const result =
                await this.guildService.memberService.MemberUtilCheckPermission(
                    res.locals.userId,
                    guild._id,
                );
            if (!result.isOwner) {
                res.status(403).json({
                    message: 'Requested user is not the guild owner',
                });
                return;
            }

            try {
                (
                    await this.guildService.memberService.findMemberInGuild(
                        guild._id,
                    )
                ).map((d) => d.delete());
            } catch (err) {
                console.log(err);
            }

            (
                await this.guildService.roleService.findRoleInGuild(guild._id)
            ).map((d) => d.delete());

            await this.guildService.userService.DeleteGuildForUser(
                res.locals.userId,
                guild._id,
            );
            await guild.delete();

            res.status(200).json({
                message: 'Guild deleted',
                guild,
            });
        } catch (error) {
            console.log(error);
            res.status(500).json({
                message: 'Error deleting guild',
            });
        }
    }
}
