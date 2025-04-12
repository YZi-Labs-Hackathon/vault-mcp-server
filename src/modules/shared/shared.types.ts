import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SuccessResponse {
  @ApiProperty({
    description: 'Error code of the request',
  })
  errorCode: number;

  @ApiProperty({
    description: 'Message of the request',
  })
  message: string;

  @ApiProperty({
    description: 'Data of the request',
  })
  data: any;
}

export class PaginationMeta {
  @ApiProperty()
  itemCount: number;
  @ApiPropertyOptional()
  totalItems?: number;
  @ApiProperty()
  itemsPerPage: number;
  @ApiPropertyOptional()
  totalPages?: number;
  @ApiProperty()
  currentPage: number;
}

export class PaginationModel<T> {
  @ApiProperty({ isArray: true })
  items: T[];

  @ApiProperty({ type: PaginationMeta })
  meta: PaginationMeta;
}
