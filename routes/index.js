var express = require('express');
var ffmpeg = require('fluent-ffmpeg');
var uuid_v5 = require('uuid/v5');
var path = require('path');
var fs = require('fs');

var router = express.Router();

// HLS default segment interval in seconds
var segment_dur = 10;

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
        if (err) {
            if (err.code !== 'EEXIST') throw err;
        }

        // dump video meta data to json file
        ffmpeg.ffprobe(req.query.v, function(err, metadata) {
            if (err) throw err;

            fs.writeFile(path.join(process_dir, 'meta.json'), JSON.stringify(metadata), {encoding: 'utf8'}, function (err) {

                if (err) throw err;
                console.log('Meta data has been exported.');
            });
        });

        // segment video to ts files & generate m3u8 playlist
        ffmpeg()
            // input file
            .input(req.query.v)
            // set multi-threads to enhance performance
            .inputOption('-threads 2')
            // start point
            .setStartTime(req.query.start)
            // video codec
            .videoCodec('libx264')
            // audio codec
            .audioCodec('libmp3lame')
            // set hls segments time
            .addOption('-hls_time', segment_dur)
            // include all the segments in the list
            .addOption('-hls_list_size',0)
            // set duration
            .setDuration(req.query.dur)

            // successful
            .on('end', function() {
                // touch a file to state status
                console.log('Segmentation has completed.');

                fs.writeFile(path.join(process_dir, '_SUCCESS'), '', {encoding: 'utf8'}, function (err) {
                    if (err) throw err;
                });
            })

            // fail
            .on('error', function(err) {
                // touch a file to state status
                console.log('Segmentation failed.');

                fs.writeFile(path.join(process_dir, '_FAIL'), err.message, {encoding: 'utf8'}, function (err) {
                    if (err) throw err;
                });
            })


            // generate m3u8 file
            .save(path.join(process_dir, 'dummy.m3u8'));
    });


    res.render('index', { title: 'Express' });
});


module.exports = router;
