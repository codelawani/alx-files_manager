import db from './db';
import redis from './redis';

export async function getUserFromHeader(authHeader) {
  const [, creds] = authHeader.split(' ');
  const decodedCreds = Buffer.from(creds, 'base64').toString('utf-8');
  const [email] = decodedCreds.split(':');
  const userColl = db.client.db().collection('users');
  const user = await userColl.findOne({ email });
  return user;
}

export async function getUserFromToken(token) {
  const key = `auth_${token}`;
  const userId = await redis.get(key);
  return [userId, key];
}
