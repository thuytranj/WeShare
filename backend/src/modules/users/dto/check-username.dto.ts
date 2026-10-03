import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';

export class CheckUsernameQueryDto {
  @ApiProperty({
    description: 'Username handle to check for availability (3-30 chars, alphanumeric + _.-)',
    example: 'alex_morgan',
    minLength: 3,
    maxLength: 30,
  })
  @IsNotEmpty({ message: 'username is required' })
  @IsString()
  @Length(3, 30, { message: 'Username must be between 3 and 30 characters' })
  @Matches(/^[a-zA-Z0-9_.-]{3,30}$/, {
    message:
      'Username can only contain letters, numbers, underscores, periods, and hyphens.',
  })
  username: string;
}

export class CheckUsernameResponseDto {
  @ApiProperty({
    description: 'Username handle queried',
    example: 'alex_morgan',
  })
  username: string;

  @ApiProperty({
    description: 'Whether the requested username is available to be claimed',
    example: true,
  })
  available: boolean;
}
