export interface music {
    filename: string;
    hash: string;
    album: string;
    albumArtist: string;
    artists: string[];
    title: string;
    year: number;
    duration: number; // in seconds
    bitsPerSample?: number;
    sampleRate?: number;
    track: {
        no: number;
        of?: number;
    }
    disc: {
        no: number;
        of?: number;
    }
    picture?: {
        format: string;
        data: Uint8Array;
    }[]
    isInstrumental?: boolean;
}

export interface Disc {
    no: number,
    musics: music[]
}

export interface Album {
    hash: string;
    name: string;
    albumArtist: string;
    NoOfDiscs: number;
    NoOfTracks: number;
    disc: Disc[];
}