import { findSongsByPlaylistsId, updateSong, uploadFile } from './adstter-song-utils.js';
import { encodeToAdstterStandard, downloadYouTubeVideo } from './video-utils.js';
import fs from 'fs';

let playlistCodes = process.argv[2];

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
    if (!song.externalVideoId || (song.certificationState !== 'CERTIFIED' && !song.downloadUrl) ||  (song.version > 2 && song.videoUrl)) {
        return;
    }
    try {
        let videoLocation = await downloadYouTubeVideo(song.externalVideoId);
        let newVideoLocation = await encodeToAdstterStandard(videoLocation);
        song.videoUrl = await uploadFile(newVideoLocation);
        const resultSong = await updateSong(song);
        fs.unlink(newVideoLocation, (err) => { });
        fs.unlink(videoLocation, (err) => { });
        console.log(resultSong);
    } catch (ex) {
        console.log(ex);
    }
}

start();