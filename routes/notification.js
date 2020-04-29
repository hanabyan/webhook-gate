var express = require('express');
var router = express.Router();

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

    servers.forEach(function(server) {
      if (server.auto_deploy) {
        deployType = 'Auto Deployment';
      }

      if (server.name) {
        serverNames.push(`(*) ${server.name} (last revision: ${server.last_revision})`);
      }
    });

    // TODO: beatufiy with new line
    var message = `>${deployType}: *${projectName}* (identifier: ${identifier}) *@${branch} on: ${serverNames.join(', ')}* is *${status}*. Start revision ${startRev} : End revision ${endRev}. By ${deployer}.`;
    console.log(message);
  }
}

function sendToSlack() {

}

module.exports = router;
