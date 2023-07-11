import express from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan';
import cors from 'cors';
import path, {dirname} from 'path';
import {fileURLToPath} from 'url';

import {toBase64} from './helper.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

//======================================

// Load Environment variables
dotenv.config();

const {NODE_ENV, PORT, JENKINS_USER, JENKINS_USER_APIKEY} = process.env;

if (
  NODE_ENV === undefined ||
  PORT === undefined ||
  JENKINS_USER === undefined ||
  JENKINS_USER_APIKEY === undefined
) {
  console.error('Error: Missing environment variables');
  process.exit(1);
}

//======================================

const headers = new Headers();
headers.set(
  'Authorization',
  `Basic ${toBase64(JENKINS_USER + ':' + JENKINS_USER_APIKEY)}`,
);

export async function getnextPendingInputAction(project, build) {
  let response = await fetch(
    `https://jenkins.joshsoftware.com/job/${project}/${build}/wfapi/nextPendingInputAction`,
    {
      method: 'GET',
      headers: headers,
    },
  );

  if (response.ok === false) {
    throw new Error();
  }

  const data = await response.json();
  return data;
}

export async function proceedPendingInput(project, build, inputId) {
  const response = await fetch(
    `https://jenkins.joshsoftware.com/job/${project}/${build}/input/${inputId}/proceedEmpty`,
    {
      method: 'POST',
      headers: headers,
    },
  );

  if (response.ok === false) {
    throw new Error();
  }
}

export async function abortPendingInput(project, build, inputId) {
  const response = await fetch(
    `https://jenkins.joshsoftware.com/job/${project}/${build}/input/${inputId}/abort`,
    {
      method: 'POST',
      headers: headers,
    },
  );

  if (response.ok === false) {
    throw new Error();
  }
}

//======================================

const app = express();

app.use(cors());
app.use(morgan(NODE_ENV === 'production' ? 'combined' : 'dev'));

app.get('/', async (req, res) => {
  const {project, build, action} = req.query;

  if (project === undefined || build === undefined || action === undefined) {
    return res.sendFile(path.join(__dirname, 'views', 'invalidURL.html'));
  }

  let inputInfo;
  try {
    inputInfo = await getnextPendingInputAction(project, build);

    if (inputInfo === null) {
      return res.sendFile(
        path.join(__dirname, 'views', 'noActionToPerform.html'),
      );
    }
  } catch {
    return res.sendFile(path.join(__dirname, 'views', 'invalidURL.html'));
  }

  if (action === 'proceed') {
    try {
      await proceedPendingInput(project, build, inputInfo.id);
      return res.sendFile(path.join(__dirname, 'views', 'success.html'));
    } catch {
      return res.sendFile(
        path.join(__dirname, 'views', 'somethingWentWrong.html'),
      );
    }
  } else if (action === 'abort') {
    try {
      await abortPendingInput(project, build, inputInfo.id);
      return res.sendFile(path.join(__dirname, 'views', 'abort.html'));
    } catch {
      return res.sendFile(
        path.join(__dirname, 'views', 'somethingWentWrong.html'),
      );
    }
  }

  return res.sendFile(path.join(__dirname, 'views', 'invalidURL.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

process.on('SIGINT', function () {
  console.log('\nGracefully shutting down from SIGINT (Ctrl-C)');
  process.exit(0);
});
