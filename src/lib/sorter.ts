import type { Album, Disc, music } from "@/types/music";

export function albumMusicSorter(a: music, b: music) {
    return (a.disc.no - b.disc.no) || (a.track.no - b.track.no);
}

export async function getAlbumHash(text: string) {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hash = await window.crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}


export function getNextFreeTrackNo(dics: Disc, preferred: number) {
    if (preferred <= 0) {
        return dics.musics.length + 1;
    }
    const trackNos = new Set(dics.musics.map(m => m.track.no));
    if (trackNos.has(preferred)) {
        let nextNo = 1;
        while (trackNos.has(nextNo)) {
            nextNo++;
        }
        return nextNo;
    }

    return preferred;
}


export function checkIfSoundtrack(title: string, filename: string): boolean {
    const soundtrackIndicators = [
        "soundtrack", "ost", "サウンドトラック", "オリジナル"
    ];
    const lowerTitle = title.toLowerCase();
    const lowerFilename = filename.toLowerCase();
    return soundtrackIndicators.some(indicator => lowerTitle.includes(indicator) || lowerFilename.includes(indicator));
}

export async function albumsReSorter(albums: Album[]) {
    const allMusics: music[] = [];
    for (const alb of albums) {
        for (const d of alb.disc) {
            for (const m of d.musics) {
                allMusics.push(m);
            }
        }
    }
    const albumMap = new Map<string, Album>();
    for (const music of allMusics) {
        const albumHash = await getAlbumHash(music.album + music.albumArtist);
        if (!albumMap.has(albumHash)) {
            albumMap.set(albumHash, {
                hash: albumHash,
                name: music.album,
                albumArtist: music.albumArtist,
                NoOfDiscs: 0,
                NoOfTracks: 0,
                disc: [],
                albumType: "Album",
            });
        }
        const album = albumMap.get(albumHash)!;

        const tempDiscNo = music.disc.no === 0 ? 1 : music.disc.no;

        let disc = album.disc.find(d => d.no === tempDiscNo);

        if (!disc) {
            disc = {
                no: tempDiscNo,
                musics: [],
            };
            album.disc.push(disc);
            album.NoOfDiscs++;
        }
        music.track.no = getNextFreeTrackNo(disc, music.track.no);
        music.disc = { no: tempDiscNo };
        disc.musics.push(music);
        album.NoOfTracks++;
    }

    const sortedAlbums = Array.from(albumMap.values());

    for (const sortedAlbum of sortedAlbums) {

        if (checkIfSoundtrack(sortedAlbum.name, "")) {
            sortedAlbum.albumType = "Soundtrack";
        } else if (sortedAlbum.NoOfTracks < 2) {
            sortedAlbum.albumType = "Single";
        }

        sortedAlbum.disc.sort((a, b) => a.no - b.no);
        sortedAlbum.disc.forEach(disc => disc.musics.sort(albumMusicSorter));

    }
    return sortedAlbums;
}

