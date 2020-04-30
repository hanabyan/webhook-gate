var express = require('express');
var router = express.Router();
const { WebClient } = require('@slack/web-api');

/**
 * currently only available for slack
 */
router.post('/', function(req, res, next) {
  var auth = {
    login: process.env.USERNAME,
    password: process.env.PASSWORD,
  };

  var b64auth = (req.headers.authorization || '').split(' ')[1] || '';
  var [login, password] = Buffer.from(b64auth, 'base64').toString().split(':');

  if (login
    && password
    && login === auth.login
    && password === auth.password
  ) {
    // TODO: ensure for base64-encoded signature from Deploy
    var data = req.body;
    // var data = dummyData;
    
    // console.log(JSON.stringify(data));
    deployHqHandler(data);

    return res.end('OK');
  }

  // Access denied...
  res.status(401).send('Authentication failure.')
});

// deployhq handler
function deployHqHandler(req) {
  var payload = JSON.parse(req.payload);
  var {
    identifier,
    servers,
    project: {
      name: projectName,
    },
    deployer,
    branch,
    start_revision: { ref: startRev },
    end_revision: { ref: endRev },
    status,
    timestamps: {
      queued_at,
      started_at,
      completed_at,
      duration,
    },
  } = payload;

  // TODO: get server name
  // name, last_revision, auto_deploy

  if (req.payload) {
    var deployType = 'Manual Deployment';
    var serverNames = [];
    var timeInfo = `>Queued at: ${new Date(queued_at)}\n>Started at: ${new Date(started_at)}\n`;

    servers.forEach(function(server) {
      if (server.auto_deploy) {
        deployType = 'Auto Deployment';
      }

      if (server.name) {
        serverNames.push(`>- ${server.name} (last revision: ${server.last_revision})\n`);
      }
    });

    if (status !== 'running') {
      timeInfo = `>Completed at: ${new Date(completed_at)}\n`;
    }

    // TODO: beatufiy with new line
    var message = `@channel\n>${deployType}: *${projectName}* is \`${status}\`.\n>Branch: *@${branch}*, on: \n${serverNames.join('')}>Identifier: ${identifier}\n${timeInfo}>Start revision ${startRev}\n>End revision ${endRev}\n>By ${deployer}.`;
    sendToSlack(message);
  }
}

async function sendToSlack(message) {
  var token = process.env.SLACK_TOKEN;
  var channel1 = process.env.SLACK_CHANNEL_1;
  var web = new WebClient(token);
  try {
    var response = await web.chat.postMessage({ channel: channel1, text: message, username: 'Info Deploy' })
    console.log(response);
  } catch(error) {
    console.log(error);
  }
}

module.exports = router;
