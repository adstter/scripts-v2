import youtubedl from 'youtube-dl';
import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import { exec } from 'child_process';

const formatMap = {
    HD: "--format=137/136/37/22",
    SD: "--format=18"
}

export const encodeToAdstterStandard = (file) => {
    console.log('Encoding to video to adstter standard');
    return new Promise((resolve, reject) => {
        const outputFile = `processed-videos/${file}`;
        const normalizeEbu = `ffmpeg-normalize './${file}' -vf -t -13 -lrt 1 -o '${outputFile}' -c:a libmp3lame -b:a 192K`
        exec(normalizeEbu, (err, stdout, stderr) => {
            if (err) {
                console.log(err);
                reject(err);
            }
            resolve(outputFile);
        });
    });
}

export const downloadYouTubeVideo = (videoId, videoType) => {
    const downloaded = 0;
    return new Promise((resolve, reject) => {
        console.log(`Descargando video ${videoId}`);
        let video = youtubedl(`http://www.youtube.com/watch?v=${videoId}`,
            // Optional arguments passed to youtube-dl.
            [formatMap[videoType]]
            // Additional options can be given for calling `child_process.execFile()`.
        );
        video.on('info', function(info) {
            console.log('Download started')
            console.log('filename: ' + info._filename)
          
            // info.size will be the amount to download, add
            let total = info.size + downloaded
            console.log('size: ' + total)
          
            if (downloaded > 0) {
              // size will be the amount already downloaded
              console.log('resuming from: ' + downloaded)
          
              // display the remaining bytes to download
              console.log('remaining bytes: ' + info.size)
            }
          })
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