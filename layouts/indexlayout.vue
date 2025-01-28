<template>
  <div class="min-h-screen flex flex-col">
    <div
      class="flex justify-between p-4"
      @click="handleHome"
      style="cursor: pointer"
    >
      <div class="flex items-center">
        <span class="pr-2">
          <!-- <img
            class="mx-auto h-12 w-auto"
            src="../assets/images/nsuaborde_logo.png"
            style="width: 3rem; height: 3rem"
            alt="Workflow"
          /> -->

        </span>
        <Icon name="lucide:heart-handshake" class="h-6 w-6 text-blue-500 pr-3" />

        <span class="text-2xl font-bold text-gray-800">RevGh</span>
      </div>
      <div></div>
    </div>
    <slot />
  </div>
</template>

<script setup lang="js">
import { useRouter } from 'vue-router'

const router = useRouter()


const handleHome = () => {
  router.push('/')
}

const handleLogin = () => {
  router.push('/')
}
</script>
