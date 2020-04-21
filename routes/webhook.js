var express = require('express');
var { exec } = require('child_process');
var router = express.Router();

function ls() {
    exec('ls -al', function(err, stdOut, stdErr) {
        if (err) {
            console.log(err);
            return;
        }

        console.log(`stdOut: ${stdOut}`);
        console.log(`stdErr: ${stdErr}`);
    })
}

router.get('/', function(req, res, next) {
    ls();
    res.send('OK');
});

module.exports = router;
