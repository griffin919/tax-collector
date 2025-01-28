# pages/index.vue
<template>
  <div
    class="p-6 max-w-6xl mx-auto space-y-6 relative min-h-screen flex flex-col items-center justify-center bg-gray-50"
  >
    <div class="flex items-center">
      <Icon name="lucide:heart-handshake" class="h-6 w-6 text-blue-500 pr-3" />
      <span class="text-2xl font-bold text-gray-800">RevGh</span>
    </div>
    
    <div class="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
      <!-- Header -->
      <div class="text-center mb-8">
        <div
          class="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4"
        >
          <Icon name="lucide:lock-keyhole" class="w-8 h-8 text-blue-500" />
        </div>
        <h1 class="text-2xl font-semibold text-gray-900">Welcome Back</h1>
        <p class="mt-2 text-gray-600">Enter your PIN to continue</p>
      </div>

      <!-- Login Form -->
      <form @submit.prevent="handleLogin" class="space-y-6">
        <div>
          <!-- Username Input -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              v-model="username"
              type="text"
              placeholder="Enter your username"
              class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          
          <!-- PIN Input -->
          <div class="flex justify-center space-x-4">
            <input
              v-for="(digit, index) in 4"
              :key="index"
              type="password"
              :name="`pin-${index}`"
              v-model="pin[index]"
              @input="handlePinInput($event, index)"
              @keydown="handleKeyDown($event, index)"
              class="w-12 h-12 text-center text-2xl border-2 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-colors"
              maxlength="1"
              autocomplete="off"
              required
            />
          </div>
        </div>

        <!-- Error Message -->
        <div v-if="error" class="text-red-500 text-sm text-center">
          {{ error }}
        </div>

        <!-- Action Buttons -->
        <div class="flex space-x-3">
          <button
            type="button"
            @click="clearForm"
            class="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
          >
            <Icon name="lucide:x" class="w-5 h-5" />
            <span>Clear</span>
          </button>
          <button
            type="submit"
            :disabled="loading"
            class="flex-1 py-3 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <template v-if="loading">
              <Icon name="lucide:loader" class="w-5 h-5 animate-spin" />
            </template>
            <template v-else>
              <Icon name="lucide:arrow-right" class="w-5 h-5" />
            </template>
            <span>Enter</span>
          </button>
        </div>
      </form>

      <!-- Help Text -->
      <div class="mt-6 text-center">
        <p class="text-sm text-gray-600">
          Need help? Contact your administrator
        </p>
      </div>
    </div>

    <div class="mt-6 text-center">
      <p class="text-sm text-gray-600">Rigel Inc. © 2025, Accra</p>
    </div>
  </div>
</template>

<script setup>
const router = useRouter()
const username = ref('')
const pin = ref(['', '', '', ''])
const error = ref('')
const loading = ref(false)

const { fetchUsers } = useSettingsDB()

const handlePinInput = (event, index) => {
  const value = event.target.value
  // Ensure only numbers
  if (isNaN(value)) {
    pin.value[index] = ''
    return
  }

  // Update pin value
  pin.value[index] = value

  // Auto-focus next input
  if (value && index < 3) {
    const nextInput = document.querySelector(`input[name=pin-${index + 1}]`)
    if (nextInput) nextInput.focus()
  }
}

const handleKeyDown = (event, index) => {
  // Handle backspace
  if (event.key === 'Backspace' && !pin.value[index] && index > 0) {
    const prevInput = document.querySelector(`input[name=pin-${index - 1}]`)
    if (prevInput) {
      prevInput.focus()
      pin.value[index - 1] = ''
    }
  }
}

const clearForm = () => {
  username.value = ''
  pin.value = ['', '', '', '']
  error.value = ''
  // Focus username input after clearing
  document.querySelector('input[type="text"]').focus()
}

const handleLogin = async () => {
  error.value = ''
  loading.value = true

  try {
    const pinCode = pin.value.join('')
    if (pinCode.length !== 4) {
      error.value = 'Please enter a 4-digit PIN'
      return
    }

    if (!username.value.trim()) {
      error.value = 'Please enter your username'
      return
    }

    // Fetch users and validate credentials
    const users = await fetchUsers()
    const user = users.find(u => 
      u.username.toLowerCase() === username.value.toLowerCase() && 
      u.password === pinCode
    )

    if (user) {
      localStorage.setItem('user_pin', pinCode)

      const toast = useToast()
      toast.add({
        title: 'Success',
        description: 'Successfully logged in',
        color: 'green'
      })

      // Redirect based on role
      if (user.role === 'Admin') {
        router.push('/donate')
      } else {
        router.push('/donations')
      }
    } else {
      error.value = 'Invalid username or PIN'
      clearForm()
    }
  } catch (err) {
    console.error('Login error:', err)
    error.value = 'Login failed. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>