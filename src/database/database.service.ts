import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createPool, Pool } from 'mysql2/promise';

@Injectable()
export class DatabaseService {
  private pool: Pool;

  constructor(private readonly config: ConfigService) {
    this.pool = createPool({
      host: this.config.get<string>('DB_HOST'),
      port: this.config.get<number>('DB_PORT', 3306),
      user: this.config.get<string>('DB_USER'),
      password: this.config.get<string>('DB_PASSWORD'),
      database: this.config.get<string>('DB_NAME'),
      ssl: this.config.get<string>('DB_SSL', 'false') === 'true' ? { rejectUnauthorized: false } : undefined,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
  }

  getPool() {
    return this.pool;
  }
}
