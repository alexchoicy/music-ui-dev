<script setup lang="ts">
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const props = defineProps({
    uploadAlbums: {
        type: Function,
        required: true,
    },
    blockUpload: {
        type: Boolean,
        required: true,
    },
})

</script>

<template>
    <Card class="w-full">
        <CardHeader>
            Upload
        </CardHeader>
        <CardContent>
            <div class="w-full">
                <Button class="w-full" @click="uploadAlbums" :disabled="blockUpload">Upload</Button>
            </div>
        </CardContent>
    </Card>
</template>