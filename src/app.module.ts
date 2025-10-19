import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { PositionsModule } from './positions/positions.module';

@Module({
    imports: [
        UsersModule,
        AuthModule,
        DatabaseModule,
        PositionsModule  // Make sure this is here
    ],
    controllers: [AppController],
    providers: [],
})
export class AppModule {}