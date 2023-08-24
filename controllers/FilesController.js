import { getUserFromToken } from '../utils/helpers';
import db from '../utils/db';

export default class FilesController {
  static async postUpload(req, res) {
    const token = req.headers['x-token'];
    const legalTypes = ['file', 'image', 'folder'];
    const { userId } = getUserFromToken(token, true);
    const filesCollection = db.client.db().collection('files');
    const {
      name, type, parentId, isPublic, data,
    } = req.body;
    function respond(error, statusCode = 400, resp = res) {
      resp.status(statusCode).json({ error });
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
    if (parentId) {
      const file = filesCollection.findOne({ parentId });
      if (!file) {
        respond('Parent not found');
      } else if (file.type !== 'folder') {
        respond('Parent is not a folder');
      }
    }
  }
}
