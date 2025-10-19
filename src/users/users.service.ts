import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { Pool, RowDataPacket, ResultSetHeader } from 'mysql2/promise';

interface UserRow extends RowDataPacket {
  id: number;
  username: string;
  password: string;
  role: string;
  refresh_token: string | null;
  created_at: Date;
  updated_at: Date;
}
interface RefreshRow extends RowDataPacket { refresh_token: string | null; }

@Injectable()
export class UsersService {
  constructor(private readonly db: DatabaseService) {}
  private pool(): Pool { return this.db.getPool() as Pool; }

  async getAll(): Promise<UserRow[]> {
    const [rows] = await this.pool().query<UserRow[]>('SELECT * FROM users');
    return rows;
  }

  async getOne(id: number): Promise<UserRow> {
    const [rows] = await this.pool().query<UserRow[]>('SELECT * FROM users WHERE id = ?', [id]);
    if (!rows[0]) throw new NotFoundException(`User ${id} not found`);
    return rows[0];
  }

  async findById(id: number): Promise<UserRow | null> {
    const [rows] = await this.pool().query<UserRow[]>('SELECT * FROM users WHERE id = ?', [id]);
    return rows[0] || null;
  }

  async findByUsername(username: string): Promise<UserRow | null> {
    const [rows] = await this.pool().query<UserRow[]>('SELECT * FROM users WHERE username = ?', [username]);
    return rows[0] || null;
  }

  async create(body: { username: string; password: string; role?: string }): Promise<UserRow> {
    const [res] = await this.pool().query<ResultSetHeader>(
      'INSERT INTO users (username,password,role) VALUES (?,?,?)',
      [body.username, body.password, body.role ?? 'user'],
    );
    return { id: res.insertId, username: body.username, password: body.password, role: body.role ?? 'user', refresh_token: null, created_at: new Date(), updated_at: new Date() } as UserRow;
  }

  async createUser(username: string, password: string, role = 'user'): Promise<UserRow> {
    return this.create({ username, password, role });
  }

  async updateUser(id: number, body: Partial<{ username: string; role: string }>): Promise<UserRow> {
    await this.pool().query(
      'UPDATE users SET username = COALESCE(?, username), role = COALESCE(?, role) WHERE id = ?',
      [body.username ?? null, body.role ?? null, id],
    );
    return this.getOne(id);
  }

  async deleteUser(id: number): Promise<void> {
    await this.pool().query('DELETE FROM users WHERE id = ?', [id]);
  }

  async setRefreshToken(id: number, token: string | null): Promise<void> {
    await this.pool().query('UPDATE users SET refresh_token = ? WHERE id = ?', [token, id]);
  }

  async getRefreshToken(id: number): Promise<string | null> {
    const [rows] = await this.pool().query<RefreshRow[]>(
      'SELECT refresh_token FROM users WHERE id = ?',
      [id],
    );
    return rows[0]?.refresh_token ?? null;
  }
}