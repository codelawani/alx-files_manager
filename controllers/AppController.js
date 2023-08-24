import redis from '../utils/redis';
import db from '../utils/db';

export class AppController {
  static getStatus(req, res) {
    if (redis.isAlive && db.isAlive) {
      res.status(200).json({ redis: true, db: true });
    }
  }

  static async getStats(req, res) {
    const users = await db.nbUsers();
    const files = await db.nbFiles();
    res.status(200).json({ users, files });
  }
}
