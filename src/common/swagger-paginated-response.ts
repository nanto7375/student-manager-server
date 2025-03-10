import { applyDecorators, Type } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, ApiProperty, getSchemaPath } from '@nestjs/swagger';

export class PageResponseDto<T> {
  data: T[];

  @ApiProperty()
  count: number;
}

export const ApiOkResponsePaginated = <DataDto extends Type<unknown>>(dataDto: DataDto, additionalProperties?: any) =>
  applyDecorators(
    ApiExtraModels(PageResponseDto, dataDto),
    ApiOkResponse({
      schema: {
        allOf: [
          { $ref: getSchemaPath(PageResponseDto) },
          {
            properties: {
              data: {
                type: 'array',
                items: { $ref: getSchemaPath(dataDto) },
              },
              ...additionalProperties,
            },
          },
        ],
      },
    }),
  );
