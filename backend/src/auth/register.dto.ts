import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional } from 'class-validator';

export class RegisterDto {
    @IsString()
    @IsNotEmpty({ message: 'Name is required' })
    name: string;

    @IsEmail({}, { message: 'Must be a valid email address' })
    @IsNotEmpty()
    email: string;

    @IsString()
    @MinLength(6, { message: 'Password must be at least 6 characters long' })
    password: string;

    @IsString()
    @IsOptional()
    phone?: string;
}