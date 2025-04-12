import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';

@ValidatorConstraint({ name: 'ExistsRule', async: true })
@Injectable()
export class ExistsRule<R> implements ValidatorConstraintInterface {
  
  async validate(id: number | string | Date) {
    return true;
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.value} doesn't exist`;
  }
}
