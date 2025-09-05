<script setup lang="ts">
import { useDropZone } from "@vueuse/core";
import { parseBlob, type IAudioMetadata } from "music-metadata";
import { ref } from "vue";
import { createBLAKE3 } from "hash-wasm";
import type { Album, music } from "@/types/music";
import { Upload } from "lucide-vue-next";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { getAlbumHash, getNextFreeTrackNo } from "@/lib/sorter";

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

function checkIfInstrumental(title: string, filename: string): boolean {
    const instrumentalIndicators = [
        "instrumental", "karaoke", "Off Vocal"
    ];
    const lowerTitle = title.toLowerCase();
    const lowerFilename = filename.toLowerCase();
    return instrumentalIndicators.some(indicator => lowerTitle.includes(indicator) || lowerFilename.includes(indicator));
}

function covertToMusicObject(metadata: IAudioMetadata, hash: string, filename: string): music {
    return {
        hash: hash,
        filename: filename,
        album: metadata.common.album || "Unknown Album",
        albumArtist: metadata.common.albumartist || "Unknown Album Artist",
        artists: new Set(metadata.common.artists ?? ["Unknown Artist"]),
        title: metadata.common.title || filename,
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
        isInstrumental: checkIfInstrumental(metadata.common.title || "", filename),
    };
}


function albumMusicSorter(a: music, b: music) {
    return (a.disc.no - b.disc.no) || (a.track.no - b.track.no);
}

async function handleFiles(files: File[]) {
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
            const tempDiscNo = musicObj.disc.no === 0 ? 1 : musicObj.disc.no;
            let disc = album.disc.find(d => d.no === tempDiscNo);
            if (!disc) {
                album.NoOfDiscs += 1;
                disc = { no: tempDiscNo, musics: [] };
                album.disc.push(disc);
                album.disc.sort((a, b) => a.no - b.no);
            }
            musicObj.disc.no = disc.no;
            musicObj.track.no = getNextFreeTrackNo(disc, musicObj.track.no);
            disc.musics.push(musicObj);
            album.NoOfTracks += 1;
        } else {
            musicObj.disc.no = musicObj.disc.no === 0 ? 1 : musicObj.disc.no;
            musicObj.track.no = musicObj.track.no === 0 ? 1 : musicObj.track.no;
            props.albums.push({
                hash: await getAlbumHash(musicObj.album + musicObj.albumArtist),
                name: musicObj.album,
                albumArtist: musicObj.albumArtist,
                disc: [{
                    no: musicObj.disc.no === 0 ? 1 : musicObj.disc.no,
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
}

const { isOverDropZone } = useDropZone(dropZoneRef, {
    onDrop: async (files) => {
        if (!files) return;
        await handleFiles(files as File[]);
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
                <div class="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Upload class="h-8 w-8 text-gray-400" />
                </div>
                <h3 class="text-xl font-semibold mb-2">Choose music files</h3>
                <p class="text-gray-400 mb-6">Drag and drop or browse to upload</p>
                <Input type="file" multiple accept="audio/*" class="hidden" id="file-upload" @change="(e: Event) => {
                    const files = (e.target as HTMLInputElement).files;
                    if (files) handleFiles(Array.from(files));
                }" />
                <Button asChild class="font-semibold">
                    <Label htmlFor="file-upload" class="cursor-pointer">
                        Browse Files
                    </Label>
                </Button>
            </div>
        </div>
    </div>
</template>