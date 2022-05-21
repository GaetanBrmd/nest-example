import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Post {
  @ManyToOne(() => User, (user) => user.posts)
  user: User;

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  text: string;
}
