import youtubedl from 'youtube-dl-exec';
import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import { exec } from 'child_process';

const formatMap = {
    HD: "bestvideo[ext=mp4]+bestaudio[ext=m4a]",
    SD: "18"
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

export const downloadYouTubeVideo = async (videoId, videoType) => {
    const output = await youtubedl(`http://www.youtube.com/watch?v=${videoId}`, {
        format: formatMap[videoType],
        o: `${videoId}.mp4`,
        geoBypass: true,
        verbose:true,
        noCheckCertificate: true,
    });
    console.log('OUTPUT', output);
    return `${videoId}.mp4`;
}