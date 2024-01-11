import * as csv from 'csv-parse/sync';
import type { IFailedRecord, IRecord } from 'src/modules/records/interfaces';
import { parseString } from 'xml2js';

import { ErrorsEnum } from '../contstants';

// Move all functions to service

export async function parseCsvContent(csvData: string): Promise<IRecord[]> {
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

export async function parseXmlContent(xml: string): Promise<IRecord[]> {
  let records: IRecord[] = [];

  await parseString(xml, (err, result) => {
    if (err) {
      console.error('Error parsing XML:', err);
    } else {
      records = result.records.record.map((record: any) => ({
        reference: record.$.reference,
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

export function validateUniqueReferences(records: IRecord[]): IFailedRecord[] {
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

export function validateEndBalance(records: IRecord[]): IFailedRecord[] {
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

export function generateReport(failedRecords: IFailedRecord[]): IFailedRecord[] {
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
  }, [] as IFailedRecord[]); // You can delete type cast
}
