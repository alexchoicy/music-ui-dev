<script setup lang="ts">
import AlbumList from '@/components/upload/albumList.vue';
import MusicUploader from '@/components/upload/musicUploader.vue';
import UploadStatus from '@/components/upload/uploadStatus.vue';
import type { Album } from '@/types/music';
import { ref } from 'vue';

const albums = ref<Album[]>([]);
const blockUpload = ref(false);

function uploadAlbums() {
    // fix the set is not serialize to json 
    const albumsForLog = albums.value.map(album => ({
        ...album,
        disc: album.disc.map(disc => ({
            ...disc,
            musics: disc.musics.map(music => ({
                ...music,
                artists: Array.from(music.artists),
            })),
        })),
    }));

    console.log(JSON.parse(JSON.stringify(albumsForLog)));
}
</script>

<template>
    <div class="w-full h-full flex-col p-6">
        <div class="grid grid-cols-1 xl:grid-cols-4 gap-6">
            <div class="xl:col-span-3 space-y-6">
                <MusicUploader :albums="albums" :blockUpload="blockUpload" @update:blockUpload="blockUpload = $event" />

                <AlbumList :albums="albums" class="mt-6" @update:albums="albums = $event" :blockUpload="blockUpload" />
            </div>
            <div>
                <UploadStatus :uploadAlbums="uploadAlbums" :blockUpload="blockUpload" />
            </div>
        </div>
    </div>
</template>