import { Injectable} from '@nestjs/common';
import { InjectRepository} from '@nestjs/typeorm';
import { Repository} from 'typeorm';
import { Area } from './entities/areas.entity';
import { Container } from '../conteiners/entities/conteiners.entity';
import { CreateAreaDto } from './dto/create-area.dto';
import { ContainerType } from '../conteiners/enums/conteiner-type.enum';
import { Sensor } from 'src/sensors/entities/sensors.entity';



@Injectable()
export class AreasService{

 constructor(

@InjectRepository(Sensor)
  private sensorRepository: Repository<Sensor>,
 
@InjectRepository(Area)
 private areaRepository:Repository<Area>,

@InjectRepository(Container)
 private containerRepository:Repository<Container>

 ){}

 async create( createAreaDto:CreateAreaDto, cct:string){

    const area = await this.areaRepository.save({
        ...createAreaDto,
        tiene_contenedores:true,
        cct
    });


    const containers=[
      ContainerType.ORGANICO,
      ContainerType.INORGANICO,
      ContainerType.PET
    ];

    for(const tipo of containers){
      const container = await this.containerRepository.save({
    tipo,
    area_id: area.id
  });

  await this.sensorRepository.save({
    nombre: `Sensor-${area.nombre}-${tipo}`,
    contenedor_id: container.id,
    activo: true});
    }
    return area;
 }

 async findAll(cct:string){
   return this.areaRepository.find({
    where:{ cct },
    relations:['containers']
   });
 }

}