import { Test, TestingModule } from '@nestjs/testing';
import { HttpCode, HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { ConfigService } from '@nestjs/config';
import { GenericContainer, StartedTestContainer } from 'testcontainers';
import { CreateUserDto } from 'src/models/create-user.dto';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let container: StartedTestContainer;

  beforeAll(async () => {
    container = await new GenericContainer('postgres:14')
      .withExposedPorts(5432)
      .withEnv('POSTGRES_DB', 'stock')
      .withEnv('POSTGRES_PASSWORD', 'password')
      .start();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(ConfigService)
      .useValue({
        get: jest.fn((Key: string) => {
          switch (Key) {
            case 'db.port':
              return container.getMappedPort(5432);
            case 'db.host':
              return container.getHost();
            case 'db.database':
              return 'stock';
            case 'db.password':
              return 'password';
            case 'db.username':
              return 'postgres';
            case 'env':
              return 'development';
          }
          console.log('Unprovided config value :', Key);
        }),
      })
      .compile();

    // await moduleFixture.get(DbInitiator).up();

    app = moduleFixture.createNestApplication();
    await app.init();
  }, 100000);

  it('404 /users/{unknownId} (GET)', () => {
    return request(app.getHttpServer())
      .get('/users/9999')
      .expect(HttpStatus.NOT_FOUND);
  });

  it('200 /users (POST)', () => {
    const userDto: CreateUserDto = { firstName: 'first', lastName: 'last' };
    return request(app.getHttpServer())
      .post('/users')
      .send(userDto)
      .expect(HttpStatus.CREATED)
      .expect({ id: 1, isActive: false, ...userDto });
  });

  it('200 /users/{knownId} (GET)', () => {
    return request(app.getHttpServer())
      .get('/users/1')
      .expect(HttpStatus.OK)
      .expect({
        id: 1,
        firstName: 'first',
        lastName: 'last',
        isActive: false,
        posts: [],
      });
  });

  afterAll(async () => {
    await app.close();
    if (container) {
      await container.stop();
    }
  });
});
