import redis from '../utils/redis';
import db from '../utils/db';

export default class AppController {
  static getStatus(req, res) {
    const status = {
      redis: redis.isAlive(),
      db: db.isAlive(),
    };
    res.status(200).json(status).end();
  }

  static async getStats(req, res) {
    const users = await db.nbUsers();
    const files = await db.nbFiles();
    res.status(200).json({ users, files }).end();
  }
}
