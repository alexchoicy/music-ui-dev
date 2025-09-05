<script setup lang="ts">
import type { Album } from '@/types/music';
import { Disc3 } from 'lucide-vue-next';
import { uint8ArrayToBase64 } from 'uint8array-extras';
import { Button } from '@/components/ui/button';
import Badge from '@/components/ui/badge/Badge.vue';

const props = defineProps({
    albums: {
        type: Array as () => Album[],
        required: true,
    },
});

function getSecondToMinuteString(seconds: number) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function trackRemover(albumHash: string, trackHash: string) {
    const album = props.albums.find(a => a.hash === albumHash);
    if (!album) return;

    for (const disc of album.disc) {
        const trackIndex = disc.musics.findIndex(t => t.hash === trackHash);
        if (trackIndex !== -1) {
            disc.musics.splice(trackIndex, 1);
            album.NoOfTracks -= 1;
            if (disc.musics.length === 0) {
                const discIndex = album.disc.findIndex(d => d.no === disc.no);
                if (discIndex !== -1) {
                    album.disc.splice(discIndex, 1);
                    album.NoOfDiscs -= 1;
                }
            }
            break;
        }
    }

    if (album.disc.length === 0) {
        const albumIndex = props.albums.findIndex(a => a.hash === albumHash);
        if (albumIndex !== -1) {
            props.albums.splice(albumIndex, 1);
        }
    }
    console.log(JSON.parse(JSON.stringify(props.albums)));
}
</script>

<template>
    <div class="space-y-6">
        <div v-for="album in props.albums" :key="album.hash" class="bg-card rounded-lg border">
            <div class="p-4 border-b w-full">
                <div class="flex items-center gap-4 w-full">
                    <div class="w-16 h-16 rounded-lg flex flex-row item-center justify-center shrink-0">
                        <img v-if="album.disc[0].musics?.[0]?.picture?.[0]?.data"
                            v-bind:src="`data:${album.disc[0].musics?.[0]?.picture?.[0]?.format};base64,${uint8ArrayToBase64(album.disc[0].musics?.[0]?.picture?.[0]?.data)}`"
                            alt="Album Art" class="w-full h-full object-cover rounded-lg" />
                        <div v-else class="w-full h-full bg-gray-700 flex items-center justify-center rounded-lg">
                            <Disc3 class="h-8 w-8 text-gray-400" />
                        </div>
                    </div>
                    <div class=" flex-1">
                        <h2 class="text-lg font-semibold">{{ album.name }}</h2>
                        <p class="text-gray-400">{{ album.albumArtist }}</p>
                        <div class="flex items-center gap-4 mt-1">
                            <p class="text-sm text-gray-500">{{ album.NoOfTracks }} tracks</p>
                            <p class="text-sm text-gray-500">{{ album.NoOfDiscs }} discs</p>
                        </div>
                    </div>
                </div>
                <div>
                </div>
            </div>
            <div class="bg-card/20">
                <div class="px-4 py-2 border-b bg-card/50">
                    <div class="flex items-center text-xs gap-4 text-gray-400 font-medium">
                        <div className="w-8 text-center">#</div>
                        <div className="flex-1">Title</div>
                        <div className="w-20 text-center">Duration</div>
                        <div className="w-20"></div>
                    </div>
                </div>
                <div v-for="disc in album.disc" class=" divide-y divide-gray-800/30 w-full">
                    <div class="px-4 py-2 transition-colors group ">
                        <div class="flex items-center gap-4">
                            <div class="text-center">
                                <span>Track {{ disc.no }}</span>
                            </div>
                        </div>
                    </div>
                    <div v-for="track in disc.musics" class="divide-y hover:bg-gray-800/30">
                        <div class="px-4 py-1 transition-colors group">
                            <div class="flex items-center gap-4">
                                <div class="w-8 text-center">
                                    <span class="text-sm">{{ track.track.no }}</span>
                                </div>
                                <div class="flex-1 min-w-0">
                                    <h3 class="font-medium text-sm truncate">{{
                                        track.title }}
                                        <Badge v-if="track.isInstrumental"
                                            class="dark:border-purple-500/50 dark:text-purple-300 border-purple-700/50 text-purple-500 text-xs px-1 py-0"
                                            variant="secondary">
                                            Instrumental
                                        </Badge>
                                    </h3>
                                    <span v-for="(artist, index) in track.artists"
                                        class="text-xs text-gray-400 truncate">
                                        {{ artist }}<span v-if="!(index === track.artists.length - 1)">, </span>
                                    </span>
                                </div>
                                <div class="w-20 text-center">
                                    <span class="text-sm text-gray-400">{{ getSecondToMinuteString(track.duration)
                                        }}</span>
                                </div>
                                <div class="w-20 flex text-center justify-end gap-1 ">
                                    <Button variant="ghost" class="h-8 w-8 p-0">
                                        <span class="text-xs">Edit</span>
                                    </Button>
                                    <Button variant="ghost" class="h-8 w-8 p-0"
                                        @click="trackRemover(album.hash, track.hash)">
                                        <span class="text-xs">Del</span>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    </div>
</template>