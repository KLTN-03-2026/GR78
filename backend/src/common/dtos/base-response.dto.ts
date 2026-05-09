import { ApiProperty } from '@nestjs/swagger';

export class BaseResponseDto<T> {
    @ApiProperty({ example: true })
    success!: boolean;

    @ApiProperty({ example: 'Operation successful' })
    message?: string;

    @ApiProperty({ type: Object, nullable: true })
    data?: T;
}
