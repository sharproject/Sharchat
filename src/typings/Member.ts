import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { Guild } from '../model/Guild';
import { Member } from '../model/Member';
import { BaseControllerResponse } from '.';

export class JoinGuildInput {
    @ApiProperty()
    @IsNotEmpty()
    id: string;
}
export class LeaveGuildInput {
    @ApiProperty()
    @IsNotEmpty()
    id: string;
}

export class JoinGuildResponse extends BaseControllerResponse {
    @ApiProperty({
        description: 'user was join guild before (true if user join and then leave)',
    })
    Joined: boolean;
    @ApiProperty()
    guild: Guild;
    @ApiProperty()
    member: Member;
}

export class LeaveGuildResponse extends BaseControllerResponse {
    @ApiProperty()
    guild: Guild;
    @ApiProperty()
    member: Member;
}

export class GetMemberResponse extends BaseControllerResponse {
    @ApiProperty({
        type: () => Member,
        nullable: true,
    })
    member: Member | null;
}
