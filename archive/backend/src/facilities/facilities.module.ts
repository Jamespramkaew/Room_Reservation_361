import { Module } from '@nestjs/common';
import { FacilitiesController } from './facilities.controller';
import { FacilitiesService } from './facilities.service';
import { FacilitiesRepository } from './facilities.repository';

@Module({
  controllers: [FacilitiesController],
  providers: [FacilitiesService, FacilitiesRepository],
  exports: [FacilitiesService], // export ถ้า module อื่นต้องการใช้
})
export class FacilitiesModule {}