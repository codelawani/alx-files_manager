import db from '../utils/db';
import { getUserFromToken } from '../utils/helpers';

const bcrypt = require('bcryptjs');

export default class UsersController {
  static async postNew(req, res) {
    const { email, password } = req.body;
    if (!email) res.status(400).end('Missing email');
    if (!password) res.status(400).end('Missing password');
    const usersColl = await db.client.db().collection('users');
    const userExists = await usersColl.findOne({ email });
    if (!userExists) {
      const hashedpw = await bcrypt.hash(password, 10);
      const newUser = await usersColl.insertOne({ email, password: hashedpw });
      res.status(201).json({ email, id: newUser.insertedId });
    } else {
      res.status(400).json({ error: 'Already exist' });
    }
  }

  static async getMe(req, res) {
    const header = req.headers['x-token'];
    const { userId, user } = await getUserFromToken(header, true);
    if (!user) {
      res.status(401).json({ error: 'Unauthorized' });
    } else {
      res.json({ email: user.email, id: userId });
    }
  }
}
