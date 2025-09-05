<script setup lang="ts">
import type { Album } from '@/types/music';
import { Disc3, X } from 'lucide-vue-next';
import { uint8ArrayToBase64 } from 'uint8array-extras';
import { Button } from '@/components/ui/button';
import Badge from '@/components/ui/badge/Badge.vue';
import { ref } from 'vue';
import type { music } from '@/types/music';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { FormControl, FormDescription, FormField } from "@/components/ui/form"
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'
import { useFieldArray, useForm } from 'vee-validate';
import FormItem from '@/components/ui/form/FormItem.vue';
import FormLabel from '@/components/ui/form/FormLabel.vue';
import { Input } from '@/components/ui/input'

const props = defineProps({
    albums: {
        type: Array as () => Album[],
        required: true,
    },
});

const currentTrack = ref<music | null>(null)
const isTrackEditDialogOpen = ref(false)


function getSecondToMinuteString(seconds: number) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function getCurrentTrackInfo(albumHash: string, trackHash: string) {
    const album = props.albums.find(a => a.hash === albumHash);
    if (!album) return null;

    for (const disc of album.disc) {
        const track = disc.musics.find(t => t.hash === trackHash);
        if (track) {
            return {
                track
            };
        }
    }

    return null;
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

function openTrackDialog(albumHash: string, trackHash: string) {
    const trackInfo = getCurrentTrackInfo(albumHash, trackHash);
    if (trackInfo) {
        currentTrack.value = trackInfo.track;
        isTrackEditDialogOpen.value = true;
        trackForm.resetForm({
            values: {
                title: currentTrack.value?.title,
                albumArtist: currentTrack.value?.albumArtist === "Unknown Album Artist" ? "" : currentTrack.value?.albumArtist,
                artists: currentTrack.value?.artists.length === 1 && currentTrack.value?.artists[0] === "Unknown Artist" ? [""] : currentTrack.value?.artists,
            }
        })
    }
}
const trackEditFormSchema = toTypedSchema(z.object({
    title: z.string().optional(),
    albumArtist: z.string().optional(),
    artists: z.array(z.string()).min(1, "At least one artist is required"),
    // album: z.string().optional(),
    // year: z.number().min(1900).max(new Date().getFullYear()).optional(),
    // trackNo: z.number().min(1).optional(),
    // discNo: z.number().min(1).optional(),
    // genre: z.string().optional(),
    // isInstrumental: z.boolean().optional(),
}));

const trackForm = useForm({
    validationSchema: trackEditFormSchema,
    initialValues: {
        title: '',
        albumArtist: '',
        artists: [''],
    },
})

const { fields: artistsFields, remove: artistsFieldsRemove } = useFieldArray<string>('artists')


const onTrackFormSubmit = trackForm.handleSubmit((values) => {
    console.log(values);
})

function onRemoveArtist(idx: number) {
    if (artistsFields.value.length > 1) artistsFieldsRemove(idx)
    console.log(JSON.parse(JSON.stringify(artistsFields.value)));
    console.log(JSON.parse(JSON.stringify(currentTrack.value)));
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
                                    <Button variant="ghost" class="h-8 w-8 p-0"
                                        @click="openTrackDialog(album.hash, track.hash)">
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
        <Dialog :open="isTrackEditDialogOpen" @update:open="isTrackEditDialogOpen = $event">
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Track metadata</DialogTitle>
                    <DialogDescription>
                        the metadata editing will not effect the original file. (yet) i think tehe.
                    </DialogDescription>
                </DialogHeader>
                <form @submit="onTrackFormSubmit" class="space-y-4">
                    <FormField v-slot="{ componentField }" name="title">
                        <FormItem>
                            <FormLabel>Title</FormLabel>
                            <FormControl>
                                <Input type="text" v-bind="componentField"></Input>
                            </FormControl>
                        </FormItem>
                    </FormField>
                    <FormField v-slot="{ componentField }" name="albumArtist">
                        <FormItem>
                            <FormLabel>Album Artists</FormLabel>
                            <FormControl>
                                <Input type="text" v-bind="componentField" placeholder="Empty if unknown."></Input>
                            </FormControl>
                            <FormDescription>
                                The Main artist for the album. All track should have the same album artist.
                            </FormDescription>
                        </FormItem>
                    </FormField>
                    <FormField v-for="(artistField, index) in artistsFields" :key="artistField.key"
                        :name="`artists.${index}`" v-slot="{ componentField }">
                        <FormItem>
                            <FormLabel>Artist {{ index + 1 }}</FormLabel>
                            <FormControl>
                                <Input type="text" v-bind="componentField"></Input>
                                <Button v-if="artistsFields.length > 1" type="button" variant="ghost" size="sm"
                                    class="h-9 w-9 p-0" @click="onRemoveArtist(index)" title="Remove">
                                    <X class="h-4 w-4" />
                                </Button>
                            </FormControl>
                        </FormItem>
                    </FormField>
                </form>
            </DialogContent>
        </Dialog>
    </div>
</template>