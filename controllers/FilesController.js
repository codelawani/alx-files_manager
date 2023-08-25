import { getUserFromToken, toObjId } from '../utils/helpers';
import db from '../utils/db';

const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

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
      respond('Unauthorized');
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
    res.status(201).json(response);
  }
}
