import { IsNumber } from 'class-validator';

export class CreateReadingDto{

    @IsNumber()
    sensorId!:number;

}