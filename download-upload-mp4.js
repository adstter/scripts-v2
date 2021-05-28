import { findSongsByPlaylistsId, updateSong, uploadFile } from './adstter-song-utils.js';
import { encodeToAdstterStandard, downloadYouTubeVideo } from './video-utils.js';
import fs from 'fs';

let videoType = process.argv[2];
let playlistCodes = process.argv[3];

const start = async () => {
    let playlists = playlistCodes.split(",");
    for (let playlistCode of playlists) {
        let songs = await findSongsByPlaylistsId(playlistCode);
        for (let song of songs) {
            await processSongs(song);
        }
    }
}

const processSongs = async (song) => {
    if (!song.externalVideoId || (song.certificationState !== 'CERTIFIED' && !song.downloadUrl && !song.videoUrl) ||  (song.version > 2 && song.videoUrl)) {
        return;
    }
    try {
        let videoLocation = await downloadYouTubeVideo(song.externalVideoId, videoType);
        let newVideoLocation = await encodeToAdstterStandard(videoLocation);
        const videoUrl = await uploadFile(newVideoLocation);
        song.videoUrl = videoUrl;
        const resultSong = await updateSong(song);
        fs.unlink(newVideoLocation, (err) => { });
        fs.unlink(videoLocation, (err) => { });
        console.log(resultSong);
    } catch (ex) {
        console.log(ex);
    }
}

start();