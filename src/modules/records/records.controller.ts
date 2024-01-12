import { Controller, HttpStatus, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

import { IFile } from '../../common/interfaces';
import { FailedRecordDto } from './dtos/';
import type { IFailedRecord } from './interfaces/';
import { RecordsService } from './records.service';

@Controller('records')
@ApiTags('Records')
export class RecordsController {
  constructor(private recordsService: RecordsService) {}

  @Post('validate')
  @UseInterceptors(FileInterceptor('file'))
  @ApiResponse({
    status: HttpStatus.OK,
    type: FailedRecordDto,
    description: 'Failed records response',
    isArray: true,
  })
  async validateRecord(@UploadedFile() file: IFile): Promise<IFailedRecord[]> {
    return this.recordsService.validateFile(file);
  }
}
