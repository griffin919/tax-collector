<template>
    <div class="p-6 max-w-6xl mx-auto space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-semibold text-gray-900">Settings</h1>
      </div>
  
      <!-- Loading State -->
      <div v-if="isLoading" class="flex justify-center py-8">
        <Icon name="lucide:loader" class="h-8 w-8 text-blue-500 animate-spin" />
      </div>
  
      <!-- Content -->
      <template v-else>
        <!-- Tabs -->
        <div class="mb-6">
          <div class="border-b border-gray-200">
            <nav class="flex -mb-px">
              <button
                @click="activeTab = 'taxes'"
                :class="[
                  'py-4 px-6 font-medium text-sm inline-flex items-center',
                  activeTab === 'taxes'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                ]"
              >
                Tax Types
              </button>
              <button
                @click="activeTab = 'users'"
                :class="[
                  'py-4 px-6 font-medium text-sm inline-flex items-center',
                  activeTab === 'users'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                ]"
              >
                Users
              </button>
            </nav>
          </div>
        </div>
  
        <!-- Tax Types Tab -->
        <div v-if="activeTab === 'taxes'" class="bg-white rounded-lg shadow-sm">
          <!-- Add New Tax Form -->
          <div class="p-6 border-b">
            <form @submit.prevent="handleAddTax">
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <input
                    v-model="newTax.name"
                    type="text"
                    placeholder="Tax Type Name"
                    class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <input
                    v-model="newTax.description"
                    type="text"
                    placeholder="Description"
                    class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <input
                    v-model="newTax.amount"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Amount"
                    class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>
              <div class="mt-4">
                <button
                  type="submit"
                  class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                  :disabled="isLoading"
                >
                  <Icon
                    v-if="isLoading"
                    name="lucide:loader"
                    class="h-5 w-5 animate-spin"
                  />
                  <Icon v-else name="lucide:plus" class="h-5 w-5" />
                  Add Tax Type
                </button>
              </div>
            </form>
          </div>
  
          <!-- Tax Types List -->
          <div v-if="taxes.length" class="divide-y">
            <div
              v-for="tax in taxes"
              :key="tax.id"
              class="p-4 flex items-center justify-between hover:bg-gray-50"
            >
              <div>
                <h3 class="font-medium">{{ tax.name }}</h3>
                <p class="text-sm text-gray-600">{{ tax.description }}</p>
                <p class="text-sm font-medium text-blue-600">
                  Amount: GHS {{ formatCurrency(tax.amount) }}
                </p>
              </div>
              <div class="flex gap-2">
                <button
                  @click="handleEditTax(tax)"
                  class="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                >
                  <Icon name="lucide:edit" class="h-5 w-5" />
                </button>
                <button
                  @click="handleDeleteTax(tax.id)"
                  class="p-2 text-gray-600 hover:text-red-600 transition-colors"
                >
                  <Icon name="lucide:trash-2" class="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
          <div v-else class="p-8 text-center text-gray-500">
            No tax types added yet
          </div>
        </div>
  
        <!-- Users Tab -->
        <div v-if="activeTab === 'users'" class="bg-white rounded-lg shadow-sm">
          <!-- Add New User Form -->
          <div class="p-6 border-b">
            <form @submit.prevent="handleAddUser">
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <input
                    v-model="newUser.username"
                    type="text"
                    placeholder="Username"
                    class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <input
                    v-model="newUser.password"
                    type="password"
                    placeholder="PIN"
                    class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <select
                    v-model="newUser.role"
                    class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select Role</option>
                    <option value="Admin">Admin</option>
                    <option value="Collector">Collector</option>
                  </select>
                </div>
              </div>
              <div class="mt-4">
                <button
                  type="submit"
                  class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                  :disabled="isLoading"
                >
                  <Icon
                    v-if="isLoading"
                    name="lucide:loader"
                    class="h-5 w-5 animate-spin"
                  />
                  <Icon v-else name="lucide:plus" class="h-5 w-5" />
                  Add User
                </button>
              </div>
            </form>
          </div>
  
          <!-- Users List -->
          <div v-if="users.length" class="divide-y">
            <div
              v-for="user in users"
              :key="user.id"
              class="p-4 flex items-center justify-between hover:bg-gray-50"
            >
              <div>
                <h3 class="font-medium">{{ user.username }}</h3>
                <p class="text-sm text-gray-600">{{ user.role }}</p>
              </div>
              <div class="flex gap-2">
                <button
                  @click="handleEditUser(user)"
                  class="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                >
                  <Icon name="lucide:edit" class="h-5 w-5" />
                </button>
                <button
                  @click="handleDeleteUser(user.id)"
                  class="p-2 text-gray-600 hover:text-red-600 transition-colors"
                >
                  <Icon name="lucide:trash-2" class="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
          <div v-else class="p-8 text-center text-gray-500">
            No users added yet
          </div>
        </div>
      </template>
  
      <!-- Edit Tax Modal -->
      <div
        v-if="isEditTaxModalOpen"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      >
        <div class="bg-white rounded-lg shadow-xl max-w-md w-full">
          <div class="p-6">
            <h2 class="text-xl font-semibold mb-4">Edit Tax Type</h2>
            <form @submit.prevent="handleUpdateTax" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Tax Type Name
                </label>
                <input
                  v-model="editingTax.name"
                  type="text"
                  class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <input
                  v-model="editingTax.description"
                  type="text"
                  class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Amount
                </label>
                <input
                  v-model="editingTax.amount"
                  type="number"
                  step="0.01"
                  min="0"
                  class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div class="flex justify-end gap-2">
                <button
                  type="button"
                  @click="isEditTaxModalOpen = false"
                  class="px-4 py-2 border text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                  :disabled="isLoading"
                >
                  <Icon
                    v-if="isLoading"
                    name="lucide:loader"
                    class="h-5 w-5 animate-spin"
                  />
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
  
      <!-- Edit User Modal -->
      <div
        v-if="isEditUserModalOpen"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      >
        <div class="bg-white rounded-lg shadow-xl max-w-md w-full">
          <div class="p-6">
            <h2 class="text-xl font-semibold mb-4">Edit User</h2>
            <form @submit.prevent="handleUpdateUser" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <input
                  v-model="editingUser.username"
                  type="text"
                  class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  New PIN (leave blank to keep current)
                </label>
                <input
                  v-model="editingUser.password"
                  type="password"
                  class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  v-model="editingUser.role"
                  class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="Admin">Admin</option>
                  <option value="Collector">Collector</option>
                </select>
              </div>
              <div class="flex justify-end gap-2">
                <button
                  type="button"
                  @click="isEditUserModalOpen = false"
                  class="px-4 py-2 border text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                  :disabled="isLoading"
                >
                  <Icon
                    v-if="isLoading"
                    name="lucide:loader"
                    class="h-5 w-5 animate-spin"
                  />
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import { v4 as uuidv4 } from 'uuid'
  
  // Initialize Firebase settings composable
  const { 
    isLoading, 
    error,
    fetchTaxTypes,
    addTaxType,
    updateTaxType,
    deleteTaxType,
    fetchUsers,
    addUser,
    updateUser,
    deleteUser
  } = useSettingsDB()
  
  // State
  const activeTab = ref('taxes')
  const isEditTaxModalOpen = ref(false)
  const isEditUserModalOpen = ref(false)
  
  const taxes = ref([])
  const users = ref([])



const newTax = ref({ name: '', description: '', amount: '' })
const newUser = ref({ username: '', password: '', role: 'Collector' })
const editingTax = ref({ id: null, name: '', description: '', amount: '' })
const editingUser = ref({ id: null, username: '', password: '', role: '' })

// Format helpers
const formatCurrency = (amount) => {
  return Number(amount).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')
}

// Load data
const loadTaxTypes = async () => {
  try {
    const data = await fetchTaxTypes()
    taxes.value = data
  } catch (err) {
    console.error('Error loading tax types:', err)
    const toast = useToast()
    toast.add({
      title: 'Error',
      description: 'Failed to load tax types',
      color: 'red'
    })
  }
}

const loadUsers = async () => {
  try {
    const data = await fetchUsers()
    users.value = data
  } catch (err) {
    console.error('Error loading users:', err)
    const toast = useToast()
    toast.add({
      title: 'Error',
      description: 'Failed to load users',
      color: 'red'
    })
  }
}

// Tax handlers
const handleAddTax = async () => {
  try {
    const taxData = {
      id: uuidv4(),
      name: newTax.value.name,
      description: newTax.value.description,
      amount: parseFloat(newTax.value.amount)
    }
    
    const result = await addTaxType(taxData)
    if (result.success) {
      await loadTaxTypes()
      newTax.value = { name: '', description: '', amount: '' }
      const toast = useToast()
      toast.add({
        title: 'Success',
        description: 'Tax type added successfully',
        color: 'green'
      })
    }
  } catch (err) {
    console.error('Error adding tax:', err)
    const toast = useToast()
    toast.add({
      title: 'Error',
      description: 'Failed to add tax type',
      color: 'red'
    })
  }
}

const handleEditTax = (tax) => {
  editingTax.value = { ...tax }
  isEditTaxModalOpen.value = true
}

const handleUpdateTax = async () => {
  try {
    const result = await updateTaxType(editingTax.value.id, {
      name: editingTax.value.name,
      description: editingTax.value.description,
      amount: parseFloat(editingTax.value.amount)
    })
    
    if (result.success) {
      await loadTaxTypes()
      isEditTaxModalOpen.value = false
      const toast = useToast()
      toast.add({
        title: 'Success',
        description: 'Tax type updated successfully',
        color: 'green'
      })
    }
  } catch (err) {
    console.error('Error updating tax:', err)
    const toast = useToast()
    toast.add({
      title: 'Error',
      description: 'Failed to update tax type',
      color: 'red'
    })
  }
}

const handleDeleteTax = async (id) => {
  const confirmed = await $confirm({
    title: 'Delete Tax Type',
    content: 'Are you sure you want to delete this tax type? This action cannot be undone.',
    confirmLabel: 'Delete',
    cancelLabel: 'Cancel',
    type: 'danger'
  })

  if (!confirmed) return

  try {
    const result = await deleteTaxType(id)
    if (result.success) {
      await loadTaxTypes()
      const toast = useToast()
      toast.add({
        title: 'Success',
        description: 'Tax type deleted successfully',
        color: 'green'
      })
    }
  } catch (err) {
    console.error('Error deleting tax:', err)
    const toast = useToast()
    toast.add({
      title: 'Error',
      description: 'Failed to delete tax type',
      color: 'red'
    })
  }
}

// User handlers
const handleAddUser = async () => {
  try {
    const userData = {
      id: uuidv4(),
      username: newUser.value.username,
      password: newUser.value.password,
      role: newUser.value.role,
      createdAt: Date.now()
    }
    
    const result = await addUser(userData)
    if (result.success) {
      await loadUsers()
      newUser.value = { username: '', password: '', role: 'Collector' }
      const toast = useToast()
      toast.add({
        title: 'Success',
        description: 'User added successfully',
        color: 'green'
      })
    }
  } catch (err) {
    console.error('Error adding user:', err)
    const toast = useToast()
    toast.add({
      title: 'Error',
      description: 'Failed to add user',
      color: 'red'
    })
  }
}

const handleEditUser = (user) => {
  editingUser.value = { ...user, password: '' }
  isEditUserModalOpen.value = true
}

const handleUpdateUser = async () => {
  try {
    const userData = {
      username: editingUser.value.username,
      role: editingUser.value.role,
      updatedAt: Date.now()
    }
    
    // Only include password if it was changed
    if (editingUser.value.password) {
      userData.password = editingUser.value.password
    }
    
    const result = await updateUser(editingUser.value.id, userData)
    if (result.success) {
      await loadUsers()
      isEditUserModalOpen.value = false
      const toast = useToast()
      toast.add({
        title: 'Success',
        description: 'User updated successfully',
        color: 'green'
      })
    }
  } catch (err) {
    console.error('Error updating user:', err)
    const toast = useToast()
    toast.add({
      title: 'Error',
      description: 'Failed to update user',
      color: 'red'
    })
  }
}

const handleDeleteUser = async (id) => {
  const confirmed = await $confirm({
    title: 'Delete User',
    content: 'Are you sure you want to delete this user? This action cannot be undone.',
    confirmLabel: 'Delete',
    cancelLabel: 'Cancel',
    type: 'danger'
  })

  if (!confirmed) return

  try {
    const result = await deleteUser(id)
    if (result.success) {
      await loadUsers()
      const toast = useToast()
      toast.add({
        title: 'Success',
        description: 'User deleted successfully',
        color: 'green'
      })
    }
  } catch (err) {
    console.error('Error deleting user:', err)
    const toast = useToast()
    toast.add({
      title: 'Error',
      description: 'Failed to delete user',
      color: 'red'
    })
  }
}

// Initialize data
onMounted(async () => {
  await Promise.all([loadTaxTypes(), loadUsers()])
})

// Page Meta
definePageMeta({
  title: 'Settings',
  description: 'Manage tax types and user accounts',
  layout: 'mainlayout'
})
</script>