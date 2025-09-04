<script setup lang="ts">
import { useDropZone } from "@vueuse/core";
import { parseBlob, type IAudioMetadata } from "music-metadata";
import { ref } from "vue";
import { createBLAKE3 } from "hash-wasm";
import type { Album, music } from "@/types/music";

const props = defineProps({
    albums: {
        type: Array as () => Album[],
        required: true,
    },
});

const dropZoneRef = ref<HTMLDivElement>();
const blockUpload = ref(false);

async function getMetadata(file: File) {
    return await parseBlob(file);
}

async function hashFileStream(file: File) {
    const hasher = await createBLAKE3();
    const reader = file.stream().getReader();

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        hasher.update(value);
    }

    return hasher.digest('hex');
}

function covertToMusicObject(metadata: IAudioMetadata, hash: string, filename: string): music {
    return {
        hash: hash,
        filename: filename,
        album: metadata.common.album || "Unknown Album",
        albumArtist: metadata.common.albumartist || "Unknown Album Artist",
        artists: metadata.common.artists || ["Unknown Artist"],
        title: metadata.common.title || "Unknown Title",
        year: metadata.common.year || 0,
        duration: metadata.format.duration || 0,
        bitsPerSample: metadata.format.bitsPerSample || 0,
        sampleRate: metadata.format.sampleRate || 0,
        track: {
            no: metadata.common.track.no || 0,
            of: metadata.common.track.of || 0,
        },
        disc: {
            no: metadata.common.disk.no || 0,
            of: metadata.common.disk.of || 0,
        },
        picture: metadata.common.picture || [],

    };
}


function albumMusicSorter(a: music, b: music) {
    return (a.disc.no - b.disc.no) || (a.track.no - b.track.no);
}

async function getAlbumHash(text: string) {
    const hasher = await createBLAKE3();
    hasher.update(text);
    return hasher.digest('hex');
}

const { isOverDropZone } = useDropZone(dropZoneRef, {
    onDrop: async (files) => {
        if (blockUpload.value) return;
        blockUpload.value = true;
        for (const file of files ?? []) {
            const metadata = await getMetadata(file);
            const hash = await hashFileStream(file);
            const musicObj = covertToMusicObject(metadata, hash, file.name);

            const duplicate = props.albums.some(album =>
                album.disc.some(disc => disc.musics.some(m => m.hash === hash))
            );
            if (duplicate) {
                console.log(`Duplicate file detected: ${file.name}, skipping...`);
                continue;
            }
            const album = props.albums.find((a) => a.name === musicObj.album && a.albumArtist === musicObj.albumArtist);
            if (album) {
                let disc = album.disc.find(d => d.no === musicObj.disc.no);
                if (!disc) {
                    album.NoOfDiscs += 1;
                    disc = { no: musicObj.disc.no || 1, musics: [] };
                    album.disc.push(disc);
                }
                disc.musics.push(musicObj);
                album.NoOfTracks += 1;
            } else {
                props.albums.push({
                    hash: await getAlbumHash(musicObj.album + musicObj.albumArtist),
                    name: musicObj.album,
                    albumArtist: musicObj.albumArtist,
                    disc: [{
                        no: 1,
                        musics: [musicObj]
                    }],
                    NoOfTracks: 1,
                    NoOfDiscs: musicObj.disc.of || 1,
                });
            }
        }
        for (const album of props.albums) {
            album.disc.forEach(disc => disc.musics.sort(albumMusicSorter));
        }
        blockUpload.value = false;
    },
    multiple: true,
});
</script>

<template>
    <div class="xl:col-span-3 space-y-6">
        <div class="bg-sidebar rounded-lg border p-6">
            <div ref="dropZoneRef"
                class="border-2 border-dashed rounded-lg p-12 text-center transition-all duration-200 hover:bg-card/50"
                :class="blockUpload ? 'opacity-50 pointer-events-none' : ''">
                <div>
                    isOverDropZone: {{ isOverDropZone }}
                </div>
            </div>
        </div>
    </div>
</template>