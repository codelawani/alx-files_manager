import db from '../utils/db';

const bcrypt = require('bcrypt');

export class UsersController {
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
}
