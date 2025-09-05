<script setup lang="ts">
import AlbumList from '@/components/upload/albumList.vue';
import MusicUploader from '@/components/upload/musicUploader.vue';
import UploadStatus from '@/components/upload/uploadStatus.vue';
import type { Album } from '@/types/music';
import { ref } from 'vue';

const albums = ref<Album[]>([]);
const blockUpload = ref(false);
</script>

<template>
    <div class="w-full h-full flex-col p-6">
        <div class="grid grid-cols-1 xl:grid-cols-4 gap-6">
            <div class="xl:col-span-3 space-y-6">
                <MusicUploader :albums="albums" :blockUpload="blockUpload" @update:blockUpload="blockUpload = $event" />

                <AlbumList :albums="albums" class="mt-6" @update:albums="albums = $event" :blockUpload="blockUpload" />
            </div>
            <div>
                <UploadStatus />
            </div>
        </div>
    </div>
</template>