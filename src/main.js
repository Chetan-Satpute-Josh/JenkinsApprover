import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import path, {dirname} from 'path';
import {fileURLToPath} from 'url';

import {
  getnextPendingInputAction,
  proceedPendingInput,
  abortPendingInput,
} from './api.js';
import {sendEmail} from './helper.js';
import {NODE_ENV, PORT} from './constant.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

//======================================

const app = express();

app.use(cors());
app.use(morgan(NODE_ENV === 'production' ? 'combined' : 'dev'));

app.get('/', async (req, res) => {
  const {project, build, action, token, email} = req.query;

  if (project === undefined || build === undefined || action === undefined) {
    return res.sendFile(path.join(__dirname, 'views', 'invalidURL.html'));
  }

  let inputInfo;
  try {
    inputInfo = await getnextPendingInputAction(project, build);

    if (inputInfo === null) {
      await sendEmail(email, action);
      return res.sendFile(
        path.join(__dirname, 'views', 'noActionToPerform.html'),
      );
    }
  } catch {
    return res.sendFile(path.join(__dirname, 'views', 'invalidURL.html'));
  }

  if (action === 'proceed') {
    try {
      await proceedPendingInput(project, build, inputInfo.id, token);
      return res.sendFile(path.join(__dirname, 'views', 'success.html'));
    } catch {
      await sendEmail(email, action);
      return res.sendFile(
        path.join(__dirname, 'views', 'somethingWentWrong.html'),
      );
    }
  } else if (action === 'abort') {
    try {
      await abortPendingInput(project, build, inputInfo.id, token);
      return res.sendFile(path.join(__dirname, 'views', 'abort.html'));
    } catch {
      await sendEmail(email, action);
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
