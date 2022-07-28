import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.connectMicroservice({
    transport: Transport.NATS,
    options: {
      servers: [process.env.NATS_URI],
      queue: 'queue',
      reconnect: true,
    },
  });

  await app.startAllMicroservices();

  await app.listen(3000);
}
bootstrap();
