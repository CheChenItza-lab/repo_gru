import {
 IsHexColor,
 IsOptional,
 IsString
} from 'class-validator';

export class CreateAreaDto {

 @IsString()
 nombre!: string;

 @IsHexColor()
 color!: string;

 @IsOptional()
 @IsString()
 responsable_nombre?: string;

}