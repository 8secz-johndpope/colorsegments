var express = require('express');
var ffmpeg = require('fluent-ffmpeg');

var router = express.Router();

// Set ffmpeg path
ffmpeg.setFfmpegPath('C:\\Anaconda3\\Library\\bin\\ffmpeg.exe');
ffmpeg.setFfprobePath('C:\\Anaconda3\\Library\\bin\\ffprobe.exe');

// Segment video and generate playlist to this directory.
var process_dir = 'P:\\process';


/* GET home page. */
router.get('/', function(req, res, next) {

    // get meta data
    ffmpeg.ffprobe(req.query.v, function(err, metadata) {
        console.log(require('util').inspect(metadata, false, null));
    });

    res.render('index', { title: 'Express' });
});


module.exports = router;
