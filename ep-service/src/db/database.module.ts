import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

@Global()
@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: async () => {
        const db = process.env.DB_NAME;
        const uri = process.env.DB_URI;

        return {
          uri,
          dbName: db,
          useNewUrlParser: true,
          useUnifiedTopology: true,
          autoCreate: true,
          retryAttempts: 3,
        };
      },
    }),
  ],
})
export class DatabaseModule {}
