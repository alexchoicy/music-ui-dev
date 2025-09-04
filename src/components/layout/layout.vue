<script setup lang="ts">
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarMenu,
    SidebarMenuItem,
    SidebarTrigger,
    SidebarInset,
    SidebarProvider
} from "@/components/ui/sidebar"
import Navbar from "./navbar.vue";
import Separator from "../ui/separator/Separator.vue";
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
            <RouterView />
        </SidebarInset>
    </SidebarProvider>
</template>