import { IsEmail, IsOptional, IsString } from 'class-validator';

export class UpdateProfileDto {
    @IsString()
    @IsOptional()
    name?: string;

    @IsEmail({}, { message: 'Must be a valid email address' })
    @IsOptional()
    email?: string;
}
