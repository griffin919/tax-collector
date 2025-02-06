# components/CustomerSearch.vue
<template>
  <div class="relative">
    <div class="relative">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search customer by name or Ghana card..."
        class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        @input="handleSearch"
        @focus="showResults = true"
        required
      />
      <div 
        v-if="isLoading"
        class="absolute right-3 top-1/2 transform -translate-y-1/2"
      >
        <Icon name="lucide:loader" class="h-5 w-5 animate-spin text-gray-400" />
      </div>
    </div>

    <!-- Search Results Dropdown -->
    <div
      v-if="showResults && (searchResults.length > 0 || searchQuery)"
      class="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg border max-h-60 overflow-y-auto"
    >
      <!-- Search Results -->
      <template v-if="searchResults.length > 0">
        <button
          v-for="customer in searchResults"
          :key="customer.id"
          @click="selectCustomer(customer)"
          class="w-full px-4 py-2 text-left hover:bg-gray-50 flex flex-col"
        >
          <span class="font-medium">{{ customer.firstName }} {{ customer.lastName }}</span>
          <span class="text-sm text-gray-600">{{ customer.ghanaCard }}</span>
        </button>
      </template>

      <!-- Add New Customer Option -->
      <button
        v-if="searchQuery && searchResults.length === 0"
        @click="showAddCustomerModal = true"
        class="w-full px-4 py-2 text-left hover:bg-gray-50 text-blue-600 flex items-center gap-2"
      >
        <Icon name="lucide:plus" class="h-4 w-4" />
        Add new customer
      </button>
    </div>

    <!-- Add Customer Modal -->
    <UModal v-model="showAddCustomerModal">
      <div class="p-6">
        <h2 class="text-xl font-semibold mb-4">Add New Customer</h2>
        <form @submit.prevent="handleAddCustomer" class="space-y-4">
          <div class="grid grid-cols-1 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                First Name
              </label>
              <input
                v-model="newCustomer.firstName"
                type="text"
                class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Last Name
              </label>
              <input
                v-model="newCustomer.lastName"
                type="text"
                class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Date of Birth
              </label>
              <input
                v-model="newCustomer.dateOfBirth"
                type="date"
                class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                v-model="newCustomer.phoneNumber"
                type="tel"
                class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Ghana Card Number
              </label>
              <input
                v-model="newCustomer.ghanaCard"
                type="text"
                placeholder="GHA-123456789-0"
                class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>
          <div class="flex justify-end gap-2 pt-4">
            <UButton color="gray" @click="showAddCustomerModal = false">
              Cancel
            </UButton>
            <UButton type="submit" :loading="isAddingCustomer">
              Add Customer
            </UButton>
          </div>
        </form>
      </div>
    </UModal>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import { onClickOutside } from '@vueuse/core' // Added this import

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['update:modelValue'])

const { searchCustomers, addCustomer, validateGhanaCard } = useCustomersDB()

const searchQuery = ref('')
const searchResults = ref([])
const showResults = ref(false)
const isLoading = ref(false)
const showAddCustomerModal = ref(false)
const isAddingCustomer = ref(false)

const newCustomer = ref({
  firstName: '',
  lastName: '',
  dateOfBirth: '',
  phoneNumber: '',
  ghanaCard: ''
})

// Create a template ref for the search container
const searchContainer = ref(null)

// Watch for outside clicks to close dropdown
onClickOutside(searchContainer, () => {
  showResults.value = false
})

// Handle search input
const handleSearch = async () => {
  if (!searchQuery.value) {
    searchResults.value = []
    return
  }

  isLoading.value = true
  try {
    searchResults.value = await searchCustomers(searchQuery.value)
  } catch (error) {
    console.error('Search error:', error)
  } finally {
    isLoading.value = false
  }
}

// Handle customer selection
const selectCustomer = (customer) => {
  emit('update:modelValue', customer)
  searchQuery.value = `${customer.firstName} ${customer.lastName}`
  showResults.value = false
}

// Handle adding new customer
const handleAddCustomer = async () => {
  if (!validateGhanaCard(newCustomer.value.ghanaCard)) {
    const toast = useToast()
    toast.add({
      title: 'Error',
      description: 'Invalid Ghana Card format. Use GHA-123456789-0 format.',
      color: 'red'
    })
    return
  }

  isAddingCustomer.value = true
  try {
    const customerData = {
      id: uuidv4(),
      ...newCustomer.value
    }
    
    const result = await addCustomer(customerData)
    if (result.success) {
      // Select the newly added customer
      selectCustomer(customerData)
      showAddCustomerModal.value = false
      
      const toast = useToast()
      toast.add({
        title: 'Success',
        description: 'Customer added successfully',
        color: 'green'
      })

      // Reset form
      newCustomer.value = {
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        phoneNumber: '',
        ghanaCard: ''
      }
    }
  } catch (error) {
    console.error('Error adding customer:', error)
    const toast = useToast()
    toast.add({
      title: 'Error',
      description: 'Failed to add customer',
      color: 'red'
    })
  } finally {
    isAddingCustomer.value = false
  }
}

// Watch for model value changes to update search query
watch(() => props.modelValue, (newValue) => {
  if (newValue?.firstName) {
    searchQuery.value = `${newValue.firstName} ${newValue.lastName}`
  } else {
    searchQuery.value = ''
  }
}, { immediate: true })
</script>