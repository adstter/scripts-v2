import fetch from 'node-fetch';
import request from 'request';
import fs from 'fs';

export const findSongsByPlaylistsId = async (playlistId) => {
    console.log('Obtains playlist info')
    const playlist = await fetch(`https://papirodev.appspot.com/_ah/api/public/v1/findAudiosByPlaylist/${playlistId}/5098768313090048`);
    const result = await playlist.json();
    return result.items;
}

export const updateSong = async (song, retry = 0) => {
    try {
        console.log('Updating song info');
        const result = await fetch(`https://papirodev.appspot.com/_ah/api/api/v2/audios/${song.dbid.id}`, {
            method: 'put',
            body: JSON.stringify(song),
            headers: { 'Content-Type': 'application/json' },
        })
        return await result.json();
    } catch (tr) {
        if (retry < 10) {
            try {
                await updateSong(song, retry + 1);
            } catch (tr) {

            }
        } else {
            throw tr;
        }
    }
}

const createUploadUrl = async (retry = 0) => {
    try {
        console.log('Creating upload url')
        const result = await fetch(`https://papirodev.appspot.com/_ah/api/api/v2/files/create-url`);
        const url = await result.json();
        return url.result;
    } catch (tr) {
        if (retry < 10) {
            try {
                await createUploadUrl(retry + 1);
            } catch (tr) {

            }
        } else {
            throw tr;
        }
    }
}

export const uploadFile = async (fileToUpload) => {
    console.log('Uploading file...')
    const uploadUrl = await createUploadUrl();
    const promise = new Promise((resolve, reject) => {
        let uploadFileRequest = request.post(uploadUrl, (err, resp, body) => {
            if (err) {
                reject(resp);
            }
            console.log(`Archivo cargado exitosamente`);
            console.log(body);
            let bucket = 'garfenter-user-papiro'
            let node = JSON.parse(body).blobInfo.gsObjectName.replace('/gs/garfenter-user-papiro/', '')
            let newDownloadUrl = `https://www.googleapis.com/download/storage/v1/b/${bucket}/o/${node}?alt=media`
            resolve(newDownloadUrl);
        });
        let form = uploadFileRequest.form();
        console.log(`Archivo a cargar: ${fileToUpload}`);
        form.append('file', fs.createReadStream(`${fileToUpload}`));
    });
    return await promise;
}