import { IsEmail, IsOptional, IsString } from 'class-validator';

export class UpdateProfileDto {
    @IsString()
    @IsOptional()
    name?: string;

    @IsEmail({}, { message: 'Must be a valid email address' })
    @IsOptional()
    email?: string;
    @IsString()
    @IsOptional()
    companyNumber?: string;

    @IsString()
    @IsOptional()
    bankAccount?: string;

    @IsString()
    @IsOptional()
    businessAddress?: string;

    @IsString()
    @IsOptional()
    businessSector?: string;

    @IsString()
    @IsOptional()
    contactName?: string;

    @IsString()
    @IsOptional()
    contactPhone?: string;
}
