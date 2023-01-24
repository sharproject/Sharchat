import { ApiProperty } from "@nestjs/swagger";

export class BaseController {
    @ApiProperty({
        description:"Controller Message"
    })
    message: string;
}

export * from "./User"