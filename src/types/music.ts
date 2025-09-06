import z from "zod";

export interface music {
    filename: string;
    hash: string;
    album: string;
    albumArtist: string;
    rawArtist: string;
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
        data: string;
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
    albumType: AlbumsAlbumType;
    disc: Disc[];
}

export const AlbumsAlbumTypeEnum = z.enum([
    'Album',
    'Single',
    'Compilation',
    'Soundtrack',
    'Live',
    'Remix',
    'Other'
])

export type AlbumsAlbumType = z.infer<typeof AlbumsAlbumTypeEnum>;