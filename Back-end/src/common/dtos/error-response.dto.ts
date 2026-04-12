import { ApiProperty } from '@nestjs/swagger';

export class ErrorResponseDto {
    @ApiProperty({ example: false })
    success!: boolean;

    @ApiProperty({ example: 401 })
    statusCode!: number;

    @ApiProperty({ example: 'INVALID_CREDENTIALS' })
    code!: string;

    @ApiProperty({ example: 'Invalid email or password' })
    message!: string;

    @ApiProperty({ example: '/auth/login' })
    path!: string;

    @ApiProperty({ example: '2025-11-04T07:26:05.344Z' })
    timestamp!: string;

    @ApiProperty({
        required: false,
        example: { field: 'email', reason: 'invalid format' }
    })
    details?: Record<string, unknown>;
}




