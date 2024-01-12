import { Module } from '@nestjs/common';
import { RecordsController } from './records.controller';
import { RecordsService } from './records.service';
import { HelperService } from '../../common/services/helper.service';

@Module({
  imports: [],
  controllers: [RecordsController],
  exports: [RecordsService],
  providers: [RecordsService, HelperService],
})
export class RecordsModule {}
