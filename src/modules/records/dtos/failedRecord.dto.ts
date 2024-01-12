import { ApiProperty } from '@nestjs/swagger';

import { NumberField, StringField } from '../../../common/decorators';

export class FailedRecordDto {
  @ApiProperty()
  @NumberField()
  reference: number;

  @ApiProperty()
  @StringField()
  description: string;

  @ApiProperty({ isArray: true, type: String })
  reasons: string[];
}
