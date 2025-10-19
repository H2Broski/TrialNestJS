import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { Pool, RowDataPacket, ResultSetHeader } from 'mysql2/promise';

interface PositionRow extends RowDataPacket {
  position_id: number;
  position_code: string;
  position_name: string;
  id: number; // user id (FK)
}

interface PositionCreateDto {
  position_code: string;
  position_name: string;
}
interface PositionUpdateDto {
  position_code?: string;
  position_name?: string;
}

@Injectable()
export class PositionsService {
  constructor(private databaseService: DatabaseService) {}

  private pool(): Pool {
    return this.databaseService.getPool() as Pool;
  }

  async create(data: PositionCreateDto, userId: number) {
    const [result] = await this.pool().query<ResultSetHeader>(
      'INSERT INTO positions (position_code, position_name, id) VALUES (?, ?, ?)',
      [data.position_code, data.position_name, userId],
    );
    return { position_id: result.insertId, ...data, id: userId };
  }

  async getAll() {
    const pool = this.pool();
    const [dbRow] = await pool.query<any[]>('SELECT DATABASE() AS db');
    console.log('DB in use:', dbRow[0]?.db); // should log 'defaultdb'
    const [rows] = await pool.query<PositionRow[]>('SELECT * FROM positions ORDER BY position_id DESC');
    return rows;
  }

  async getOne(id: number) {
    const [rows] = await this.pool().query<PositionRow[]>('SELECT * FROM positions WHERE position_id = ?', [id]);
    if (!rows[0]) throw new NotFoundException(`Position ${id} not found`);
    return rows[0];
  }

  async update(id: number, data: PositionUpdateDto, userId: number) {
    // Optional owner scoping; remove "AND id = ?" if not required by your teacher
    const [currentRows] = await this.pool().query<PositionRow[]>(
      'SELECT * FROM positions WHERE position_id = ? AND id = ?',
      [id, userId],
    );
    const current = currentRows[0];
    if (!current) throw new NotFoundException(`Position ${id} not found or not owned by user`);

    const position_code = data.position_code ?? current.position_code;
    const position_name = data.position_name ?? current.position_name;

    await this.pool().query(
      'UPDATE positions SET position_code = ?, position_name = ? WHERE position_id = ? AND id = ?',
      [position_code, position_name, id, userId],
    );
    return this.getOne(id);
  }

  async remove(id: number, userId: number) {
    const [res] = await this.pool().query<ResultSetHeader>(
      'DELETE FROM positions WHERE position_id = ? AND id = ?',
      [id, userId],
    );
    if (res.affectedRows === 0) throw new NotFoundException(`Position ${id} not found or not owned by user`);
  }
}