import db from './db';
import redis from './redis';

const { ObjectId } = require('mongodb');

/**
 * Get user information from an Authorization header.
 * @param {string} authHeader - The Authorization header containing credentials.
 * @returns {Object} The user information based on the provided credentials.
 */
export async function getUserFromHeader(authHeader) {
  const userCollection = db.client.db().collection('users');
  // Split the header to retrieve credentials
  const [, base64Credentials] = authHeader.split(' ');
  // Decode the base64-encoded credentials
  const decodedCredentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');

  // Split the decoded credentials into email and password
  const [email] = decodedCredentials.split(':');
  const user = await userCollection.findOne({ email });
  return user;
}

/**
 * Get user information from a token stored in Redis.
 * @param {string} token - The token to retrieve user information for.
 * @param {boolean} fetchFromDatabase - Specify whether to fetch user information from the database.
 * @returns {Object} An object containing userId, redisKey, and user information (if requested).
 */
export async function getUserFromToken(token, fetchFromDatabase = false) {
  const userCollection = db.client.db().collection('users');
  const redisKey = `auth_${token}`;
  const userIdFromRedis = await redis.get(redisKey);
  const userIdObjectId = new ObjectId(userIdFromRedis);
  let user;
  if (fetchFromDatabase) {
    user = await userCollection.findOne({ _id: userIdObjectId });
  }

  // Return userId, redisKey, and user information (if requested)
  return { userId: userIdFromRedis, redisKey, user };
}
/**
 * Converts a string ID to a MongoDB ObjectId.
 * @param {string} id - The string ID to convert.
 * @returns {ObjectId} The corresponding ObjectId.
 */
export function toObjId(id) {
  return new ObjectId(id);
}
