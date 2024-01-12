import { BadRequestException, Injectable } from '@nestjs/common';
import * as csv from 'csv-parse/sync';
import { transformAndValidate } from 'class-transformer-validator';
import { parseString } from 'xml2js';
import { ErrorsEnum } from '../contstants';

import type { IFailedRecord, IRecord } from '../../modules/records/interfaces';
import { RecordDto } from '../../modules/records/dtos/';
import { InvalidRecordException } from '../../modules/records/exceptions/';

@Injectable()
export class HelperService {
  constructor() {}

  /**
   * @description parses the csv file content
   */
  async parseCsvContent(csvData: string): Promise<IRecord[]> {
    const parsedData: string[][] = await csv.parse(csvData);

    const convertCsvToRecord = ([
      reference,
      accountNumber,
      description,
      startBalance,
      mutation,
      endBalance,
    ]: string[]): IRecord => ({
      reference: Number(reference),
      accountNumber,
      description,
      startBalance: Number.parseFloat(startBalance),
      mutation: Number.parseFloat(mutation),
      endBalance: Number.parseFloat(endBalance),
    });

    return parsedData.slice(1).map(convertCsvToRecord);
  }

  /**
   * @description parses the xml file content
   */
  async parseXmlContent(xml: string): Promise<IRecord[]> {
    let records: IRecord[] = [];

    await parseString(xml, (err, result) => {
      if (err) {
        throw new BadRequestException(err);
      } else {
        records = result.records.record.map((record: any) => ({
          reference: +record.$.reference,
          accountNumber: record.accountNumber[0],
          description: record.description[0],
          startBalance: Number.parseFloat(record.startBalance[0]),
          mutation: Number.parseFloat(record.mutation[0]),
          endBalance: Number.parseFloat(record.endBalance[0]),
        }));
      }
    });

    return records;
  }

  /**
   * @description checks the uniquencess of the transaction references
   */
  validateUniqueReferences(records: IRecord[]): IFailedRecord[] {
    const uniqueReferences = new Set<number>();
    const failedRecords: IFailedRecord[] = [];

    for (const record of records) {
      if (uniqueReferences.has(record.reference)) {
        failedRecords.push({
          reference: record.reference,
          description: record.description,
          reasons: [ErrorsEnum.DUPLICATE_TRANSACTION_REFERENCE],
        });
      } else {
        uniqueReferences.add(record.reference);
      }
    }

    return failedRecords;
  }

  /**
   * @description checks the validation of the fields of the parsed file
   */
  async validateRecords(records: IRecord[]): Promise<void> {
    try {
      for (const record of records) {
        await transformAndValidate(RecordDto, record);
      }
    } catch (error) {
      throw new InvalidRecordException();
    }
  }

  /**
   * @description checks the end balances of the records
   */
  validateEndBalance(records: IRecord[]): IFailedRecord[] {
    const failedRecords: IFailedRecord[] = [];

    for (const record of records) {
      if (record.startBalance + record.mutation !== record.endBalance) {
        failedRecords.push({
          reference: record.reference,
          description: record.description,
          reasons: [ErrorsEnum.INVALID_END_BALANCE],
        });
      }
    }

    return failedRecords;
  }

  /**
   * @description generates report for the failed ones which consists of reference, description and reasons by connecting several records that have more than one error
   */
  generateReport(failedRecords: IFailedRecord[]): IFailedRecord[] {
    return failedRecords.reduce((result, record) => {
      const existingRecord = result.find(
        (r) => r.reference === record.reference && r.description === record.description,
      );

      if (existingRecord) {
        existingRecord.reasons = [...new Set([...existingRecord.reasons, ...record.reasons])];
      } else {
        result.push({ ...record, reasons: [...record.reasons] });
      }

      return result;
    }, [] as IFailedRecord[]);
  }
}
