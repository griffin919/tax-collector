# layouts/mainlayout.vue
<template>
  <div>
    <!-- Header -->
    <div class="sticky top-0 z-50">
      <div class="flex justify-between items-center px-6 py-4 bg-white shadow-md">
        <!-- Logo and Title -->
        <div
          @click="handleHome"
          class="flex items-center hover:opacity-80 transition-opacity cursor-pointer"
        >
          <Icon 
            name="lucide:heart-handshake" 
            class="h-6 w-6 text-blue-500 pr-3" 
          />
          <span class="text-2xl font-bold text-gray-800">Municipal Tax</span>
        </div>

        <!-- Action Icons -->
        <div class="flex items-center gap-4">
          <!-- Settings -->
          <button 
            @click="handleNavToSettings"
            class="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            v-if="currentUser?.role === 'Admin'"
          >
            <Icon name="lucide:settings" class="h-5 w-5" />
          </button>

          <!-- Profile/Logout Dropdown -->
          <div class="relative">
            <button 
              @click="isProfileMenuOpen = !isProfileMenuOpen"
              class="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
            >
              <Icon name="lucide:user" class="h-5 w-5" />
              <span class="text-sm font-medium hidden sm:block">
                {{ currentUser?.username }}
                <span class="text-gray-500">({{ currentUser?.role }})</span>
              </span>
              <Icon 
                name="lucide:chevron-down" 
                class="h-4 w-4 hidden sm:block" 
                :class="{ 'transform rotate-180': isProfileMenuOpen }"
              />
            </button>

            <!-- Profile Menu -->
            <div
              v-if="isProfileMenuOpen"
              class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-10"
            >
              <button
                @click="handleLogout"
                class="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-red-600"
              >
                <Icon name="lucide:log-out" class="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <main>
      <slot />
    </main>

    <!-- Click Outside Handler -->
    <div 
      v-if="isProfileMenuOpen"
      class="fixed inset-0 z-40"
      @click="isProfileMenuOpen = false"
    ></div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const isProfileMenuOpen = ref(false)
const currentUser = ref(null)

const { fetchUsers } = useSettingsDB()

// Load current user details
const loadCurrentUser = async () => {
  try {
    const users = await fetchUsers()
    const userPin = localStorage.getItem('user_pin')
    const user = users.find(u => u.password === userPin)
    
    if (user) {
      currentUser.value = user
    } else {
      // If user not found, log them out
      handleLogout()
    }
  } catch (error) {
    console.error('Error loading user:', error)
    const toast = useToast()
    toast.add({
      title: 'Error',
      description: 'Failed to load user details',
      color: 'red'
    })
  }
}

const handleLogout = () => {
  localStorage.removeItem('user_pin')
  currentUser.value = null
  router.push('/')
  
  const toast = useToast()
  toast.add({
    title: 'Success',
    description: 'Successfully logged out',
    color: 'green'
  })
}

const handleNavToSettings = () => {
  router.push('/settings')
}

const handleHome = () => {
  if (currentUser.value?.role === 'Admin') {
    router.push('/donate')
  } else {
    router.push('/donations')
  }
}

// Initialize
onMounted(() => {
  loadCurrentUser()
})
</script>