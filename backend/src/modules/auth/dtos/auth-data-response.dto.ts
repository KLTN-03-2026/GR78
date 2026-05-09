import { UserRole } from '@/common/enums/user-role.enum';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString } from 'class-validator';


export class LoginResponseDataDto {
    @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
    accessToken!: string;

    @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
    refreshToken?: string;

    @ApiProperty({
        example: {
            id: '1a2b3c4d-5678-90ef',
            email: 'user@example.com',
            name: 'Van Tin',
            role: 'CUSTERMOR',
        },
    })
    @IsOptional()
    user?: {
        id: string;
        email?: string;
        phone?: string;
        name?: string;
        role?: UserRole;
    };
}



export class RegisterResponseDataDto {
    @ApiProperty({ example: '1a2b3c4d-5678-90ef' })
    id!: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsEmail()
    email?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    phone?: string;


    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    fullName?: string;

}


export class TokenResponseDataDto {
    @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6...' })
    accessToken!: string;

    @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6...' })
    refreshToken?: string;
}


