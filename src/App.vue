<script setup lang="ts">
import { useColorMode } from '@vueuse/core';

const mode = useColorMode()
mode.value = 'dark' // or 'light' or 'system'
</script>

<template>
    <RouterView />
</template>
