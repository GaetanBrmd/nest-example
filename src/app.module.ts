import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { configuration } from 'config/configuration';
import { validationSchema } from 'config/validation';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoggerMiddleware } from './middlewares/logger.middleware';
import { Post } from './models/post.entity';
import { User } from './models/user.entity';

@Module({
  imports: [
    // Provide ConfigService
    ConfigModule.forRoot({
      envFilePath: `${process.cwd()}/config/env/${process.env.NODE_ENV}.env`,
      load: [configuration],
      validationSchema,
      isGlobal: true,
    }),
    // Provide DB connection
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('db.host'),
        port: configService.get('db.port'),
        username: configService.get('db.username'),
        password: configService.get('db.password'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: configService.get('env') === 'development', // WARN : Don't use true in production mode,
      }),
      inject: [ConfigService],
    }),
    // Provide repository for User entity
    TypeOrmModule.forFeature([User, Post]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
