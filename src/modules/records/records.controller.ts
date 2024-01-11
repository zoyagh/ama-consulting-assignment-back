import { Controller, HttpStatus, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

import { IFile } from '../../interfaces/';
import { FailedRecordDto } from './dtos/';
import type { IFailedRecord } from './interfaces/';
import { RecordsService } from './records.service';

@Controller('records')
@ApiTags('Records')
export class RecordsController {
  constructor(private recordsService: RecordsService) {}

  @Post('file')
  @UseInterceptors(FileInterceptor('file'))
  @ApiResponse({
    status: HttpStatus.OK,
    type: FailedRecordDto,
    description: 'Uploaded file response',
    isArray: true,
  })
  async fileUpload(@UploadedFile() file: IFile): Promise<IFailedRecord[]> {
    return this.recordsService.uploadTemporary(file);
  }
}
