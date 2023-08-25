import { getUserFromToken, toObjId } from '../utils/helpers';
import db from '../utils/db';

const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const validateUser = async (token, respond) => {
  const { userId } = await getUserFromToken(token);
  let response = true;
  console.log(userId);
  if (!userId) {
    respond('Unauthorized', 401);
    response = false;
  }
  return response;
};
export default class FilesController {
  static async postUpload(req, res) {
    const token = req.headers['x-token'];
    const legalTypes = ['file', 'image', 'folder'];
    const { userId } = await getUserFromToken(token);
    const {
      name, type, parentId, isPublic, data,
    } = req.body;
    function respond(error, statusCode = 400, resp = res) {
      resp.status(statusCode).json({ error });
    }
    if (!userId) {
      respond('Unauthorized', 401);
      return;
    }
    if (!name) {
      respond('Missing name');
      return;
    }
    if (!type || !legalTypes.includes(type)) {
      respond('Missing type');
      return;
    }
    if (!data && type !== 'folder') {
      respond('Missing data');
      return;
    }
    const filesCollection = db.client.db().collection('files');
    let folder = process.env.FOLDER_PATH || '/tmp/files_manager';
    let localPath = `${folder}/${uuidv4()}`;
    if (parentId) {
      const _id = toObjId(parentId);
      const { type, localPath: parentPath } = await filesCollection.findOne({ _id });
      localPath = `${parentPath}/${name}`;
      if (!type) {
        respond('Parent not found');
        return;
      }
      if (type !== 'folder') {
        respond('Parent is not a folder');
        return;
      }
    }
    if (type === 'folder') folder = localPath;

    // save locally
    fs.mkdir(folder, { recursive: true }, (err) => {
      if (!err) {
        if (['file', 'image'].includes(type)) {
          let fileData = Buffer.from(data, 'base64');
          if (type === 'file') fileData = fileData.toString('utf-8');
          fs.writeFile(localPath, fileData, (err) => {
            if (err) {
              console.error('Error saving file', err.message);
            }
          });
        }
      } else {
        console.error('Error creating folder', err.message);
      }
    });
    // save to mongodb
    const fileDoc = {
      userId,
      name,
      type,
      isPublic: isPublic || false,
      parentId: parentId || 0,
      localPath,
    };
    const newFile = await filesCollection.insertOne(fileDoc);
    const response = {
      id: newFile.insertedId,
      userId,
      name,
      isPublic: isPublic || false,
      parentId: parentId || 0,
      type,
    };
    // const { localPath, ...response } = { id: newFile.insertedId, ...fileDoc}
    res.status(201).json(response);
  }

  static async getShow(req, res) {
    function respond(error, statusCode = 400, resp = res) {
      resp.status(statusCode).json({ error });
    }
    const token = req.headers['x-token'];
    const { userId } = await getUserFromToken(token);
    if (!userId) {
      respond('Unauthorized');
      return;
    }
    const filesCollection = db.client.db().collection('files');
    const _id = toObjId(req.params.id);

    const userFile = await filesCollection.findOne({ userId, _id });
    console.log(userFile);
    if (!userFile) {
      respond('Not found', 404);
    } else {
      const { localPath, ...response } = userFile;
      res.status(200).json(response);
    }
  }

  static async getIndex(req, res) {
    function respond(error, statusCode = 400, resp = res) {
      resp.status(statusCode).json({ error });
    }
    const validUser = await validateUser(req.headers['x-token'], respond);
    if (!validUser) {
      return;
    }
    const parentId = req.query.parentId || 0;
    const page = req.query.page || 1;
    const filesCollection = db.client.db().collection('files');
    const file = await filesCollection.findOne({ parentId });
    if (!file) {
      res.json([]);
      return;
    }
    const limit = 20;
    const skip = (page - 1) * limit;
    const items = await filesCollection
      .find({ parentId })
      .skip(skip)
      .limit(limit)
      .project({ localPath: 0 })
      .toArray();
    res.json(items);
  }

  static async putPublish(req, res) {
    function respond(error, statusCode = 400, resp = res) {
      resp.status(statusCode).json({ error });
    }
    const filesCollection = db.client.db().collection('files');
  }

  static async putUnpublish() {}
}
