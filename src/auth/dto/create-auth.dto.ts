import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class CreateAuthDto {
    @IsString()
    name!: string;

    @IsEmail()
    @IsNotEmpty()
    email!: string;

    @IsString()
    password!: string;

    @IsString()
    imageUrl?: string;

    @IsString()
    role : string;
}
