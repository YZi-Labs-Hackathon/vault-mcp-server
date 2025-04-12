import { ApiExtraModels, ApiOkResponse, getSchemaPath } from '@nestjs/swagger';
import { applyDecorators, Type } from '@nestjs/common';
//import { PaginationModel } from '@shared/shared.types';
import { PaginationModel } from '../../modules/shared/shared.types';

export const ApiPaginatedResponse = <TModel extends Type<any>>(
  model: TModel,
) => {
  return applyDecorators(
    ApiExtraModels(PaginationModel),
    ApiOkResponse({
      description: `Get all ${model.name} paginate`,
      schema: {
        allOf: [
          { $ref: getSchemaPath(PaginationModel) },
          {
            properties: {
              items: {
                type: 'array',
                items: { $ref: getSchemaPath(model) },
              },
            },
          },
        ],
      },
    }),
  );
};
