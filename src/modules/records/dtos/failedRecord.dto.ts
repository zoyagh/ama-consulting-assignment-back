import { ApiProperty } from '@nestjs/swagger';

import { NumberField, StringField } from '../../../decorators';

export class FailedRecordDto {
  @ApiProperty()
  @NumberField()
  reference: number;

  @ApiProperty()
  @StringField()
  description: string;

  @ApiProperty({ isArray: true, type: String })
  reasons: string[];

  constructor(reference: number, description: string, reasons: string[]) {
    this.reference = reference;
    this.description = description;
    this.reasons = reasons;
  }
}
