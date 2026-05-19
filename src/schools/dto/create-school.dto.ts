import {
 IsNotEmpty,
 IsString,
 Matches
} from 'class-validator';

export class CreateSchoolDto {

 @IsString()
 @IsNotEmpty()
 nombre!: string;

 @Matches(/^[A-Z0-9]{10}$/)
 cct!: string;

}