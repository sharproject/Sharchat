import { Controller, Get, Param } from '@nestjs/common';
import { GuildService } from './guild.service';

@Controller('guild/not-auth')
export class GuildNotAuthController {
    constructor(private readonly guildService: GuildService) {}
    @Get('info/:id')
    async GetGuildInfo(@Param('id') id: string) {
        return await this.guildService.findGuildById(id);
    }
}
