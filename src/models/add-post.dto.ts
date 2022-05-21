import { IsNotEmpty, IsString } from 'class-validator';

export class AddPostDto {
  @IsString()
  @IsNotEmpty()
  text: string;
}
