// transaction.dto.ts

import { ApiProperty } from '@nestjs/swagger';
import { IsIBAN, IsNumber, IsPositive, IsString } from 'class-validator';

export class RecordDto {
  @ApiProperty({ example: 123_456, description: 'Transaction reference' })
  @IsNumber()
  transactionReference: number;

  @ApiProperty({
    example: 'NL91ABNA0417164300',
    description: 'Account number (IBAN)',
  })
  @IsIBAN()
  accountNumber: string;

  @ApiProperty({ example: 100, description: 'Starting balance in Euros' })
  @IsNumber()
  @IsPositive()
  startBalance: number;

  @ApiProperty({ example: -19.45, description: 'Mutation value (+ or -)' })
  @IsNumber()
  mutation: number;

  @ApiProperty({
    example: 'Payment for services',
    description: 'Free text description',
  })
  @IsString()
  description: string;

  @ApiProperty({ example: 80.55, description: 'End balance in Euros' })
  @IsNumber()
  endBalance: number;
}
