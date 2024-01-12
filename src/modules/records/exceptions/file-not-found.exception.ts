import { NotFoundException } from '@nestjs/common';

export class FileNotFoundException extends NotFoundException {
  constructor(error?: string) {
    super('error.fileNotFound', error);
  }
}
