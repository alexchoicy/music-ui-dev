<script setup lang="ts">
import { useColorMode } from '@vueuse/core';

const mode = useColorMode()
mode.value = 'light' // or 'light' or 'system'
</script>

<template>
    <RouterView />
</template>
