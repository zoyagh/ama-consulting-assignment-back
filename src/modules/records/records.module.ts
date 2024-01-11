import { Module } from '@nestjs/common';
import { RecordsController } from './records.controller';
import { RecordsService } from './records.service';

@Module({
  imports: [],
  controllers: [RecordsController],
  exports: [RecordsService],
  providers: [RecordsService],
})
export class RecordsModule {}
