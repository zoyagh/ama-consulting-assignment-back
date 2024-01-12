import { BadRequestException } from '@nestjs/common';

export class InvalidRecordException extends BadRequestException {
  constructor(error?: string) {
    super('error.invalidRecord', error);
  }
}
