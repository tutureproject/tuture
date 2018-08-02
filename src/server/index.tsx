import fs from 'fs';
import path from 'path';

import express from 'express';
import React from 'react';
import { renderToString } from 'react-dom/server';
import opn from 'opn';
import yaml from 'js-yaml';
import { ServerStyleSheet, StyleSheetManager } from 'styled-components';

import App from '../components/App';
import html from './html';
import { Tuture } from '../types/';

const port = 3000;
const server = express();
const tuturePath = process.env.TUTURE_PATH;

server.use(express.static('dist'));

server.get('/', (req, res) => {
  const tutureYAMLPath = path.join(tuturePath, 'tuture.yml');
  const tutureYAML = fs.readFileSync(tutureYAMLPath, {
    encoding: 'utf8',
  });
  const tuture = yaml.safeLoad(tutureYAML) as Tuture;
  const diffPath = path.join(tuturePath, '.tuture', 'diff.json');
  const diff = fs.readFileSync(diffPath, {
    encoding: 'utf8',
  });

  // add SSR style
  const sheet = new ServerStyleSheet();
  const body = renderToString(
    <StyleSheetManager sheet={sheet.instance}>
      <App diff={diff} tuture={JSON.stringify(tuture)} />
    </StyleSheetManager>,
  );
  const styleTags = sheet.getStyleTags();

  res.send(
    html({
      body,
      diff,
      css: styleTags,
      tuture: JSON.stringify(tuture),
    }),
  );
});

server.listen(port, () => {
  console.log(`Tutorial is served on http://localhost:${port}`);

  if (!process.env.WATCHING) {
    opn('http://localhost:3000');
  }
});