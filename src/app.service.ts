import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AddPostDto } from './models/add-post.dto';
import { CreateUserDto } from './models/create-user.dto';
import { PostCreatedEvent } from './models/post-created.event';
import { Post } from './models/post.entity';
import { User } from './models/user.entity';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Post) private postRepository: Repository<Post>,
    @Inject('KAFKA_CLIENT') private kafkaClient: ClientKafka,
  ) {}

  getHello(): string {
    this.logger.debug('Hello World!');
    return 'Hello World!';
  }

  findAll(): Promise<User[]> {
    return this.userRepository.find({ relations: ['posts'] });
  }

  findOne(id: number): Promise<User> {
    return this.userRepository.findOne(id, { relations: ['posts'] });
  }

  create(createUserDto: CreateUserDto): Promise<User> {
    const user = new User();
    user.firstName = createUserDto.firstName;
    user.lastName = createUserDto.lastName;
    user.isActive = !!createUserDto.isActive;
    return this.userRepository.save(user);
  }

  async addPost(userId: number, addPostDto: AddPostDto): Promise<Post> {
    const post = new Post();
    const user = new User();
    user.id = userId;
    post.user = user;
    post.text = addPostDto.text;

    const res = await this.postRepository.save(post);

    this.kafkaClient.emit(
      'post.created',
      new PostCreatedEvent(res.id, res.user.id, res.text),
    );

    return res;
  }
}
