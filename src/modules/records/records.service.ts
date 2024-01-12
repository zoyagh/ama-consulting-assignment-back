import { Injectable } from '@nestjs/common';

import type { IFile } from '../../common/interfaces/IFile';
import { ExtensionsEnum } from '../../common/contstants';
import type { IFailedRecord, IRecord } from './interfaces/';
import { HelperService } from '../../common/services/helper.service';
import { FileNotFoundException } from './exceptions';

@Injectable()
export class RecordsService {
  constructor(private helperService: HelperService) {}

  async validateFile(file: IFile): Promise<IFailedRecord[]> {
    if (!file) {
      throw new FileNotFoundException();
    }

    const fileContentString = file.buffer.toString('utf-8');
    const fileExtension = file.originalname.split('.').pop().toLowerCase();

    const records: IRecord[] =
      fileExtension === ExtensionsEnum.XML
        ? await this.helperService.parseXmlContent(fileContentString)
        : await this.helperService.parseCsvContent(fileContentString);

    await this.helperService.validateRecords(records);

    const failedRecords = [
      ...this.helperService.validateUniqueReferences(records),
      ...this.helperService.validateEndBalance(records),
    ];

    return this.helperService.generateReport(failedRecords);
  }
}
