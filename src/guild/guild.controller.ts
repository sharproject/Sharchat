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

export class EditGuildInput {
    @IsNotEmpty()
    id: string;

    @IsOptional()
    @IsNotEmpty()
    name?: string;

    @IsOptional()
    description?: string;
}

@Controller('guild')
export class GuildController {
    constructor(private readonly guildService: GuildService) {}
    @Post('/create')
    async CreateGuild(
        @Body() input: CreateGuildInput,
        @Res({ passthrough: true }) res: Response,
    ) {
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
            console.log('siuuuu');
            res.status(201);
            return {
                message: 'Guild created',
                guild: await guild.save(),
                member,
            };
        } catch (error) {
            console.log(error);
            throw new HttpException(
                'INTERNAL SERVER ERROR',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    @Delete('delete')
    async DeleteGuild(
        @Body() input: DeleteGuildInput,
        @Res({ passthrough: true }) res: Response,
    ) {
        const { id } = input;

        try {
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
            if (!result.isOwner) {
                throw new HttpException(
                    {
                        message: 'Requested user is not the guild owner',
                    },
                    HttpStatus.FORBIDDEN,
                );
            }

            try {
                for (let member of guild.members) {
                    this.guildService.memberService.MemberUtilDeleteMember(
                        member.guild._id,
                        member.user._id,
                        true,
                    );
                }
            } catch (err) {
                console.log(err);
            }

            try {
                (
                    await this.guildService.roleService.findRoleInGuild(
                        guild._id,
                    )
                ).map((d) => d.delete());
            } catch (err) {
                console.log(err);
            }
            await this.guildService.userService.DeleteGuildForUser(
                res.locals.userId,
                guild._id,
            );
            await guild.delete();

            res.status(200);
            return {
                message: 'Guild deleted',
                guild,
            };
        } catch (error) {
            console.log(error);
            throw new HttpException(
                'INTERNAL SERVER ERROR',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
    @Patch('/edit')
    async EditGuild(@Body() input: EditGuildInput, @Res() res: Response) {
        const { id, name, description } = input;
        if (!id) {
            throw new HttpException(
                {
                    message: 'Missing required fields',
                },
                HttpStatus.BAD_REQUEST,
            );
        }

        try {
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
            if (!result.permissions.canEditGuild()) {
                throw new HttpException(
                    {
                        message:
                            "Requested member doesn't have permission to edit",
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
        } catch (error) {
            console.log(error);
            throw new HttpException(
                {
                    message: 'Internal Server Error',
                },
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}
