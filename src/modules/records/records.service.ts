import { Injectable } from '@nestjs/common';

import type { IFile } from '../../../src/interfaces/IFile';
import {
  generateReport,
  parseCsvContent,
  parseXmlContent,
  validateEndBalance,
  validateUniqueReferences,
} from '../../../src/utils/calculation.helper';
import { ExtensionsEnum } from '../../contstants';
import type { IFailedRecord, IRecord } from './interfaces/';

@Injectable()
export class RecordsService {
  constructor() {}

  async uploadTemporary(file: IFile): Promise<IFailedRecord[]> {
    try {
      if (!file) {
        console.log("File doesn't exist");
      }

      const fileContentString = file.buffer.toString('utf-8');
      const fileExtension = file.originalname.split('.').pop().toLowerCase();

      const records: IRecord[] =
        fileExtension === ExtensionsEnum.XML
          ? await parseXmlContent(fileContentString)
          : await parseCsvContent(fileContentString);

      const failedRecords = [...validateUniqueReferences(records), ...validateEndBalance(records)];

      return generateReport(failedRecords);
    } catch {}
  }
}
