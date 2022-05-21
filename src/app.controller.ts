import {
  Body,
  Controller,
  Get,
  Logger,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';
import { InsertResult, QueryFailedError } from 'typeorm';
import { AppService } from './app.service';
import { AddPostDto } from './models/add-post.dto';
import { CreateUserDto } from './models/create-user.dto';
import { User } from './models/user.entity';

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);

  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('/users')
  getUsers(): Promise<User[]> {
    return this.appService.findAll();
  }

  @Get('/users/:id')
  async getUser(@Param('id') id: number): Promise<User> {
    const user = await this.appService.findOne(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  @Post('/users')
  async postUser(@Body() createUserDto: CreateUserDto) {
    this.logger.debug(createUserDto);
    return await this.appService.create(createUserDto);
  }

  @Post('/users/:id/posts')
  async addPhoto(@Param('id') userId: number, @Body() addPostDto: AddPostDto) {
    try {
      await this.appService.addPost(userId, addPostDto);
    } catch (error) {
      if (error instanceof QueryFailedError) {
        throw new NotFoundException('User not found');
      }
    }
    return addPostDto;
  }
}
