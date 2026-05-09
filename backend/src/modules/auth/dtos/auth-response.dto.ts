import { BaseResponseDto } from '@/common/dtos/base-response.dto';
import { LoginResponseDataDto, RegisterResponseDataDto, TokenResponseDataDto } from '@/modules/auth/dtos/auth-data-response.dto';
import { ApiProperty } from '@nestjs/swagger';

export class LoginResponseDto extends BaseResponseDto<LoginResponseDataDto> {
    @ApiProperty({ example: true })
    success!: boolean;

    @ApiProperty({ example: 'Login successful' })
    message?: string;

    @ApiProperty({ type: LoginResponseDataDto })
    data!: LoginResponseDataDto;
}

export class RegisterResponseDto extends BaseResponseDto<RegisterResponseDataDto> {
    @ApiProperty({ example: true })
    success!: boolean;

    @ApiProperty({ example: 'Register successful' })
    message?: string;

    @ApiProperty({ type: RegisterResponseDataDto })
    data?: RegisterResponseDataDto;
}




export class TokenResponseDto extends BaseResponseDto<TokenResponseDataDto> {
    @ApiProperty({ example: true })
    success!: boolean;

    @ApiProperty({ example: 'Register successful' })
    message?: string;

    @ApiProperty({ type: TokenResponseDataDto })
    data?: TokenResponseDataDto;
}
