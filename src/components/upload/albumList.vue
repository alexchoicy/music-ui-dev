<script setup lang="ts">
import { AlbumsAlbumTypeEnum, type Album, type AlbumsAlbumType } from '@/types/music';
import { Disc3, Plus, X } from 'lucide-vue-next';
import { uint8ArrayToBase64 } from 'uint8array-extras';
import { Button } from '@/components/ui/button';
import Badge from '@/components/ui/badge/Badge.vue';
import { ref, toRaw } from 'vue';
import type { music } from '@/types/music';
import { Dialog, DialogScrollContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { FormControl, FormDescription, FormField, FormMessage } from "@/components/ui/form"
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'
import { useFieldArray, useForm } from 'vee-validate';
import FormItem from '@/components/ui/form/FormItem.vue';
import FormLabel from '@/components/ui/form/FormLabel.vue';
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { albumsReSorter } from '@/lib/sorter';
import AlbumEditDialog from './albumEditDialog.vue';

const props = defineProps({
    albums: {
        type: Array as () => Album[],
        required: true,
    },
    blockUpload: {
        type: Boolean,
        default: false,
        required: true,
    },
});
const emit = defineEmits(['update:albums']);

const currentTrack = ref<music | null>(null)
const isTrackEditDialogOpen = ref(false)

const currentAlbum = ref<Album | null>(null)
const isAlbumEditDialogOpen = ref(false)

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
        const artists =
            currentTrack.value?.artists.size === 1 && currentTrack.value?.artists.has("Unknown Artist")
                ? [""]
                : Array.from(currentTrack.value?.artists || []);
        trackForm.resetForm({
            values: {
                title: currentTrack.value?.title,
                albumArtist: currentTrack.value?.albumArtist === "Unknown Album Artist" ? "" : currentTrack.value?.albumArtist,
                artists,
                album: currentTrack.value?.album === "Unknown Album" ? "" : currentTrack.value?.album,
                year: currentTrack.value?.year,
                trackNo: currentTrack.value?.track.no,
                discNo: currentTrack.value?.disc.no,
                isInstrumental: currentTrack.value?.isInstrumental || false,
            }
        })
    }
}
const trackEditFormSchema = toTypedSchema(z.object({
    title: z.string().optional(),
    albumArtist: z.string().optional(),
    artists: z.array(z.string()).min(1, "At least one artist is required"),
    album: z.string().optional(),
    year: z.number().min(1900).max(new Date().getFullYear()).optional(),
    trackNo: z.number().min(1).optional(),
    discNo: z.number().min(1).optional(),
    // genre: z.string().optional(),
    isInstrumental: z.boolean().optional(),
}));

const trackForm = useForm({
    validationSchema: trackEditFormSchema,
    initialValues: {
        title: '',
        albumArtist: '',
        artists: [''],
        album: '',
    },
})

const { fields: artistsFields, remove: artistsFieldsRemove, push: artistsFieldsPush } = useFieldArray<string>('artists');

const onTrackFormSubmit = trackForm.handleSubmit(async (values) => {
    currentTrack.value!.title = values.title || "Unknown Title"
    currentTrack.value!.albumArtist = values.albumArtist || "Unknown Album Artist";
    const artistsSet = new Set<string>();
    values.artists.forEach(artist => {
        const trimmed = artist.trim();
        if (trimmed) artistsSet.add(trimmed);
    });
    if (artistsSet.size === 0) artistsSet.add("Unknown Artist");
    currentTrack.value!.artists = artistsSet;

    currentTrack.value!.album = values.album || "Unknown Album";
    currentTrack.value!.year = values.year || 0;
    currentTrack.value!.track.no = values.trackNo || 0;
    currentTrack.value!.disc.no = values.discNo || 0;
    currentTrack.value!.isInstrumental = values.isInstrumental || false;

    const cloneAlbums = structuredClone(toRaw(props.albums));
    const newSortedAlbums = await albumsReSorter(cloneAlbums);
    emit('update:albums', newSortedAlbums);
    currentTrack.value = null;
    isTrackEditDialogOpen.value = false;
    trackForm.resetForm();
})

function onRemoveArtist(idx: number) {
    if (artistsFields.value.length > 1) artistsFieldsRemove(idx)
}

function onAddArtist() {
    artistsFieldsPush('')
}

function onAlbumEditOpen(albumHash: string) {
    const album = props.albums.find(a => a.hash === albumHash);
    if (!album) return;
    currentAlbum.value = album;
    isAlbumEditDialogOpen.value = true;
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
                        <h2 class="text-lg font-semibold">{{ album.name }}
                            <Badge
                                class="text-center dark:border-purple-500/50 dark:text-purple-300 border-purple-700/50 text-purple-500 text-xs px-1 py-0"
                                variant="secondary">
                                {{ album.albumType }}
                            </Badge>
                        </h2>
                        <p class="text-gray-400">{{ album.albumArtist }}</p>
                        <div class="flex items-center gap-4 mt-1">
                            <p class="text-sm text-gray-500">{{ album.NoOfTracks }} tracks</p>
                            <p class="text-sm text-gray-500">{{ album.NoOfDiscs }} discs</p>
                        </div>
                    </div>
                    <div>
                        <Button variant="ghost" class="h-9 w-9 p-0" :disabled="props.blockUpload"
                            @click="onAlbumEditOpen(album.hash)">
                            <span class="text-xs">Edit</span>
                        </Button>
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
                                <span>Disc {{ disc.no }}</span>
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
                                    <h3 class="font-medium text-sm truncate" :title="track.title">{{
                                        track.title }}
                                        <Badge v-if="track.isInstrumental"
                                            class="dark:border-purple-500/50 dark:text-purple-300 border-purple-700/50 text-purple-500 text-xs px-1 py-0"
                                            variant="secondary">
                                            Instrumental
                                        </Badge>
                                    </h3>
                                    <div class="text-xs text-gray-400">
                                        <span v-for="(artist, index) in track.artists" class="">
                                            {{ artist }}<span v-if="!(index === track.artists.size - 1)">, </span>
                                        </span>
                                    </div>
                                </div>
                                <div class="w-20 text-center">
                                    <span class="text-sm text-gray-400">{{ getSecondToMinuteString(track.duration)
                                        }}</span>
                                </div>
                                <div class="w-20 flex text-center justify-end gap-1 ">
                                    <Button variant="ghost" class="h-9 w-9 p-0" :disabled="props.blockUpload"
                                        @click="openTrackDialog(album.hash, track.hash)">
                                        <span class="text-xs">Edit</span>
                                    </Button>
                                    <Button variant="ghost" class="h-9 w-9 p-0 hover:bg-red-900/20 hover:text-red-400"
                                        :disabled="props.blockUpload" @click="trackRemover(album.hash, track.hash)">
                                        <X class="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <AlbumEditDialog v-if="currentAlbum" :isOpen="isAlbumEditDialogOpen" :currentAlbum="currentAlbum"
            @update:isOpen="isAlbumEditDialogOpen = $event" @update:currentAlbum="currentAlbum = $event" />

        <Dialog :open="isTrackEditDialogOpen" @update:open="isTrackEditDialogOpen = $event">
            <DialogScrollContent>
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
                                <div class="flex items-center gap-2">
                                    <Input type="text" v-bind="componentField"></Input>
                                    <Button v-if="artistsFields.length > 1" type="button" variant="ghost" size="sm"
                                        class="h-9 w-9 p-0 hover:bg-red-900/20 hover:text-red-400"
                                        @click="onRemoveArtist(index)" title="Remove">
                                        <X class="h-4 w-4" />
                                    </Button>
                                </div>
                            </FormControl>
                        </FormItem>
                    </FormField>
                    <Button variant="ghost"
                        class="w-full h-8 text-gray-400 hover:text-white hover:bg-gray-800 border border-dashed border-gray-700 hover:border-gray-600"
                        @click="onAddArtist" type="button">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Artist
                    </Button>
                    <FormField v-slot="{ componentField }" name="album">
                        <FormItem>
                            <FormLabel>Album</FormLabel>
                            <FormControl>
                                <Input type="text" v-bind="componentField"></Input>
                            </FormControl>
                            <FormDescription>
                                All track should have the same album name.
                            </FormDescription>
                        </FormItem>
                    </FormField>
                    <div class="grid grid-cols-3 gap-3">
                        <FormField v-slot="{ componentField }" name="year">
                            <FormItem>
                                <FormLabel>Year</FormLabel>
                                <FormControl>
                                    <Input type="number" v-bind="componentField"></Input>
                                </FormControl>
                            </FormItem>
                        </FormField>
                        <FormField v-slot="{ componentField }" name="discNo">
                            <FormItem>
                                <FormLabel>Disc No.</FormLabel>
                                <FormControl>
                                    <Input type="number" v-bind="componentField"></Input>
                                </FormControl>
                            </FormItem>
                        </FormField>
                        <FormField v-slot="{ componentField }" name="trackNo">
                            <FormItem>
                                <FormLabel>Track No.</FormLabel>
                                <FormControl>
                                    <Input type="number" v-bind="componentField"></Input>
                                </FormControl>
                            </FormItem>
                        </FormField>
                    </div>
                    <FormField v-slot="{ value, handleChange }" type="checkbox" name="isInstrumental">
                        <FormItem class="flex flex-row items-start gap-x-3 space-y-0 rounded-md border p-4 shadow">
                            <FormControl>
                                <Checkbox :model-value="value" @update:model-value="handleChange" />
                            </FormControl>
                            <div class="space-y-1 leading-none">
                                <FormLabel>Is Instrumental</FormLabel>
                                <FormDescription>
                                    Don't apply if it is part of a compilation album.
                                </FormDescription>
                                <FormMessage />
                            </div>
                        </FormItem>
                    </FormField>
                    <Button type="submit" class="w-full">Save Changes</Button>
                </form>
            </DialogScrollContent>
        </Dialog>
    </div>
</template>