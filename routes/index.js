var express = require('express');
var ffmpeg = require('fluent-ffmpeg');
var uuid_v5 = require('uuid/v5');
var path = require('path');
var fs = require('fs');

var router = express.Router();

// Set ffmpeg path
ffmpeg.setFfmpegPath('C:\\Anaconda3\\Library\\bin\\ffmpeg.exe');
ffmpeg.setFfprobePath('C:\\Anaconda3\\Library\\bin\\ffprobe.exe');

// Segment video and generate playlist to this directory.
var process_parent_dir = 'P:\\process';


/* GET home page. */
router.get('/', function(req, res, next) {
    // create unique process directory
    var process_dir = path.join(process_parent_dir, uuid_v5(req.query.v, uuid_v5.URL));

    fs.mkdir(process_dir, function (err) {
        // dump video meta data to json file
        ffmpeg.ffprobe(req.query.v, function(err, metadata) {
            if (err) throw err;

            fs.writeFile(path.join(process_dir, 'meta.json'), JSON.stringify(metadata), {encoding: 'utf8'}, function (err) {

                if (err) throw err;
                console.log('Meta data has been exported.');
            });
        });
    });


    res.render('index', { title: 'Express' });
});


module.exports = router;
