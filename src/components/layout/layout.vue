<script setup lang="ts">
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarMenu,
    SidebarInset,
    SidebarProvider
} from "@/components/ui/sidebar"
import Navbar from "./navbar.vue";
import Separator from "../ui/separator/Separator.vue";
import AudioPlayer from "../audioPlayer.vue";
</script>


<template>
    <SidebarProvider>
        <Sidebar>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarMenu>
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
        <SidebarInset>
            <Navbar />
            <Separator />
            <div class="flex flex-col h-full">
                <div class="flex-1">
                    <RouterView />
                </div>
                <AudioPlayer />
            </div>
        </SidebarInset>
    </SidebarProvider>
</template>