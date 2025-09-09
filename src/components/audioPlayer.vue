<script setup lang="ts">
import { Pause, Play, Repeat, Shuffle, SkipBack, SkipForward, Volume, Volume1, Volume2, VolumeOff } from 'lucide-vue-next';
import { onMounted, reactive, ref } from 'vue';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Slider } from '@/components/ui/slider';

const audioElement = ref<HTMLAudioElement | null>(null);
const audioSate = reactive({
    playing: false,
    seeking: false,
    duration: 0,
    current: 0,
    bufferedEnd: 0,
    volume: 0.5,
    muted: false,
})

onMounted(() => {
    audioElement.value = document.querySelector('audio');
    console.log('Audio Element:', audioElement.value?.currentTime);

})

function togglePlay() {
    if (!audioElement.value) return;
    if (audioSate.playing) {
        audioElement.value.pause();
    } else {
        audioElement.value.play();
    }
    audioSate.playing = !audioSate.playing;
}
</script>

<template>
    <div class="p-4 flex flex-row items-center gap-4 border-t">
        <div class="flex flex-row">
            <Button @click="togglePlay" variant="ghost">
                <Play v-if="!audioSate.playing" />
                <Pause v-else />
            </Button>
            <Button variant="ghost">
                <SkipBack />
            </Button>
            <Button variant="ghost">
                <SkipForward />
            </Button>
            <Button variant="ghost">
                <Shuffle />
            </Button>
            <Button variant="ghost">
                <Repeat />
            </Button>
        </div>
        <div class="flex flex-1 items-center gap-4">
            <div>00:00</div>
            <div class="flex-1">
                <Progress :model-value="20" class="" />
            </div>
            <div>
                <div>00:00</div>
            </div>
        </div>
        <div>
            <HoverCard>
                <HoverCardTrigger as-child>
                    <Button variant="ghost" @click="audioSate.muted = !audioSate.muted">
                        <VolumeOff v-if="audioSate.muted" />
                        <Volume v-else-if="audioSate.volume === 0" />
                        <Volume1 v-else-if="audioSate.volume * 100 > 0 && audioSate.volume * 100 < 50" />
                        <Volume2 v-else />
                    </Button>
                </HoverCardTrigger>
                <HoverCardContent side="top" :side-offset="5" class="p-5 w-auto m-5">
                    <Slider :default-value="[audioSate.volume * 100]" :step="1" :max="100"
                        @update:model-value="(value) => { console.log(value) }" orientation="vertical" />
                </HoverCardContent>
            </HoverCard>
        </div>
        <div className="flex items-center gap-3  md:order-4  hover:bg-accent dark:hover:bg-accent/50">
            <div
                class="w-10 h-10 md:w-12 md:h-12 rounded-lg overflow-hidden bg-gray-700 flex items-center justify-center">
                <img src="" alt="Album cover" class="w-full h-full object-cover" />
            </div>
            <div class="text-left">
                <div class="text-white font-medium text-sm">Get Lucky</div>
                <div class="text-gray-400 text-xs">Daft Punk</div>
                <div class="text-gray-500 text-xs hidden md:block">Random Access Memories</div>
            </div>
            <div>
                <div></div>
            </div>
        </div>
        <audio controls hidden src=""></audio>
    </div>
</template>