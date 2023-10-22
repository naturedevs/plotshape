<template>
    <div class="main-layout w-100 vh-100">
        <!-- <navbar /> -->
        <div class="w-100 mt-0 pt-2 px-4" style="height: calc(100vh - 0px);">
            <child />
        </div>
    </div>
</template>

<script>
import Navbar from '~/components/Navbar'

export default {
    name: 'MainLayout',
    components: {
        Navbar
    }
}
</script>
