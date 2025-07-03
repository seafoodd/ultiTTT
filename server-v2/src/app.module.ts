import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    // AccountModule,
    // UserModule,
    // SearchModule,
    // FriendsModule,
    // PaypalModule,
    // PrismaModule (to provide prisma client)
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
