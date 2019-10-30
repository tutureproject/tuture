import fs from 'fs';
import http from 'http';
import path from 'path';
import yaml from 'js-yaml';
import logger from 'morgan';
import multer from 'multer';
import express, { Request, Response, NextFunction } from 'express';
import socketio from 'socket.io';

import {
  TUTURE_YML_PATH,
  DIFF_PATH,
  EDITOR_STATIC_PATH,
  EDITOR_PATH,
} from './constants';

const workspace = process.env.TUTURE_PATH || process.cwd();
const tutureYMLPath = path.join(workspace, TUTURE_YML_PATH);
const diffPath = path.join(workspace, DIFF_PATH);

const makeServer = (config: any) => {
  const app = express();
  const server = http.createServer(app);
  const { assetsRoot } = config;

  // Socket.IO server instance.
  const io = socketio(server);

  // File upload middleware.
  const upload = multer({
    storage: multer.diskStorage({
      destination(req, file, cb) {
        cb(null, assetsRoot);
      },
    }),
  });

  // Middleware for checking whether assets root exists.
  const checkAssetsRoot = (req: Request, res: Response, next: NextFunction) => {
    if (!fs.existsSync(assetsRoot)) {
      fs.mkdirSync(assetsRoot);
    }
    next();
  };

  if (process.env.NODE_ENV === 'development') {
    app.use(logger('dev'));
  }

  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use('/static', express.static(EDITOR_STATIC_PATH));
  app.use(`/${assetsRoot}`, express.static(assetsRoot));

  app.get('/', (_, res) => {
    const html = fs
      .readFileSync(path.join(EDITOR_PATH, 'index.html'))
      .toString();
    res.send(html);
  });

  app.get('/diff', (_, res) => {
    res.json(JSON.parse(fs.readFileSync(diffPath).toString()));
  });

  app.get('/tuture', (_, res) => {
    res.json(yaml.safeLoad(fs.readFileSync(tutureYMLPath).toString()));
  });

  app.post('/save', (req, res) => {
    const body = req.body;
    try {
      body.updated = new Date();
      const tuture = yaml.safeDump(body);
      fs.writeFileSync(tutureYMLPath, tuture);
      res.sendStatus(200);
    } catch (err) {
      res.status(500).send({ msg: err.message });
    }
  });

  app.post('/upload', checkAssetsRoot, upload.single('file'), (req, res) => {
    const savePath = path.join(assetsRoot, req.file.filename);
    res.json({ path: savePath });
  });

  app.get('/reload', (_, res) => {
    io.emit('reload');
    res.sendStatus(200);
  });

  return app;
};

export default makeServer;
