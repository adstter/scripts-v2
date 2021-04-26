import youtubedl from 'youtube-dl';
import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
export const encodeToAdstterStandard = (file) => {
    console.log('Encoding to video to adstter standard');
    return new Promise((resolve, reject) => {
        let result = {};
        result.output = `processed-videos/${file}`;
        let command = ffmpeg(file);
        
        command.audioFilters('volume=-13dB');

        command.on('end', function () {
            console.log('Encoding completed...');
            resolve(result.output);
        });

        command.on('error', function (err) {
            console.log(err);
            reject();
        });

        command.save(result.output);
    });
}

export const downloadYouTubeVideo = (videoId) => {
    return new Promise((resolve, reject) => {
        console.log(`Descargando video ${videoId}`);
        let video = youtubedl(`http://www.youtube.com/watch?v=${videoId}`,
            // Optional arguments passed to youtube-dl.
            ['--format=18'],
            // Additional options can be given for calling `child_process.execFile()`.
        );
        video.on('end', () => {
            console.log(`El video ${videoId} termino de descargar`);
            resolve(`${videoId}.mp4`);
        });
        video.on('error', (err) => {
            console.log(`Error al descargar ${videoId}`);
            console.log(err);
            reject();
        });
        video.pipe(fs.createWriteStream(`${videoId}.mp4`, { flags: 'a' }));

    });
}