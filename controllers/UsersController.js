import db from '../utils/db';
import { getUserFromToken } from '../utils/helpers';

const bcrypt = require('bcrypt');
const { ObjectId } = require('mongodb');

export default class UsersController {
  static async postNew(req, res) {
    const { email, password } = req.body;
    if (!email) res.status(400).end('Missing email');
    if (!password) res.status(400).end('Missing password');
    const usersColl = db.client.db().collection('users');
    const userExists = await usersColl.findOne({ email });
    if (!userExists) {
      const hashedpw = await bcrypt.hash(password, 10);
      const newUser = await usersColl.insertOne({ email, password: hashedpw });
      console.log(newUser);
      res.status(201).json({ email, id: newUser.insertedId });
    }
  }

  static async getMe(req, res) {
    const header = req.headers['x-token'];
    const [userId] = await getUserFromToken(header);
    console.log(userId);
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
    } else {
      const usersColl = db.client.db().collection('users');
      const userObjId = new ObjectId(userId);
      const user = await usersColl.findOne({ _id: userObjId });
      res.json({ email: user.email, id: userId });
    }
  }
}
