import { findSongsByPlaylistsId, updateSong, uploadFile } from './adstter-song-utils.js';
import { encodeToAdstterStandard, downloadYouTubeVideo } from './video-utils.js';

let playlistCode = process.argv[2];

const start = async () => {
    let songs = await findSongsByPlaylistsId(playlistCode);
    for (let song of songs) {
        await processSongs(song);
    }
}

const processSongs = async (song) => {
    if (!song.externalVideoId || song.videoUrl || song.certificationState !== 'CERTIFIED') {
        return;
    }
    try {
        let videoLocation = await downloadYouTubeVideo(song.externalVideoId);
        let newVideoLocation = await encodeToAdstterStandard(videoLocation);
        song.videoUrl = await uploadFile(newVideoLocation);
        const resultSong = await updateSong(song);
        console.log(resultSong);
    } catch (ex) {
        console.log(ex);
    }
}

start();