<script setup lang="ts">
import AlbumList from '@/components/upload/albumList.vue';
import MusicUploader from '@/components/upload/musicUploader.vue';
import type { Album } from '@/types/music';
import { ref } from 'vue';

const albums = ref<Album[]>([]);
</script>

<template>
    <div class="w-full h-full flex-col p-6">
        <div class="grid grid-cols-1 xl:grid-cols-4 gap-6">
            <div class="xl:col-span-3 space-y-6">
                <MusicUploader :albums="albums" />

                <AlbumList :albums="albums" class="mt-6" @update:albums="albums = $event" />
            </div>
            <div>
                TEST
            </div>
        </div>
    </div>
</template>