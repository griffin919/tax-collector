# components/AddDonation.vue
<template>
  <div class="p-6">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-semibold text-gray-900">Record Payment</h2>
      <button
        @click="$emit('close')"
        class="text-gray-500 hover:text-gray-700"
      >
        <Icon name="lucide:x" class="h-6 w-6" />
      </button>
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-4">
      <!-- Name -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Name
        </label>
        <input
          v-model="formData.name"
          type="text"
          placeholder="Enter payer's name"
          class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>

      <!-- Contact -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Contact
        </label>
        <input
          v-model="formData.contact"
          type="tel"
          placeholder="Enter contact number"
          class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>

      <!-- Tax Type -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Tax Type
        </label>
        <select
          v-model="formData.taxType"
          @change="handleTaxTypeChange"
          class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required
        >
          <option value="">Select Tax Type</option>
          <option 
            v-for="tax in taxes" 
            :key="tax.id"
            :value="tax.name"
          >
            {{ tax.name }} - GHS {{ formatCurrency(tax.amount) }}
          </option>
        </select>
      </div>

      <!-- Date -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Date
        </label>
        <input
          v-model="formData.date"
          type="datetime-local"
          class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>

      <!-- Amount -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Amount
        </label>
        <input
          v-model="formData.amount"
          type="number"
          step="0.01"
          placeholder="Enter amount"
          class="w-full px-4 py-2 border rounded-lg bg-gray-50"
          readonly
        />
      </div>

      <!-- Collector Name -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Collector Name
        </label>
        <input
          v-model="formData.collector_name"
          type="text"
          placeholder="Enter collector's name"
          class="w-full px-4 py-2 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required
          readonly
        />
      </div>

      <!-- Submit Button -->
      <div class="flex justify-end gap-3">
        <button
          type="button"
          @click="$emit('close')"
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
          <Icon v-else name="lucide:save" class="h-5 w-5" />
          Save Payment
        </button>
      </div>
    </form>

    <!-- Preview Print and SMS -->
    <div v-if="showPreview" class="mt-6 border-t pt-6">
      <h3 class="text-lg font-medium mb-4">Preview</h3>
      
      <!-- Receipt Preview -->
      <div class="bg-gray-50 p-4 rounded-lg mb-4">
        <h4 class="font-medium mb-2">Receipt</h4>
        <div class="text-sm space-y-1">
          <p><span class="text-gray-600">Name:</span> {{ formData.name }}</p>
          <p><span class="text-gray-600">Contact:</span> {{ formData.contact }}</p>
          <p><span class="text-gray-600">Tax Type:</span> {{ formData.taxType }}</p>
          <p><span class="text-gray-600">Amount:</span> GHS {{ formatCurrency(formData.amount) }}</p>
          <p><span class="text-gray-600">Date:</span> {{ formatDate(formData.date) }}</p>
          <p><span class="text-gray-600">Collector:</span> {{ formData.collector_name }}</p>
        </div>
      </div>

      <!-- SMS Preview -->
      <div class="bg-gray-50 p-4 rounded-lg">
        <h4 class="font-medium mb-2">SMS Message</h4>
        <p class="text-sm text-gray-600">
          Dear {{ formData.name }}, your payment of GHS {{ formatCurrency(formData.amount) }} for {{ formData.taxType }} on {{ formatDate(formData.date) }} has been received. Thank you.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { v4 as uuidv4 } from 'uuid'

const { fetchTaxTypes } = useSettingsDB()
const { recordDonation } = useRealtimeDB()
const { sendSMS } = useSMS()
const { printReceipt } = useUtils()
const {fetchLoggedInUser} = useSettingsDB()

const emit = defineEmits(['donation-added', 'close'])

const isLoading = ref(false)
const taxes = ref([])
const showPreview = ref(false)

const formData = ref({
  name: '',
  contact: '',
  taxType: '',
  amount: '',
  collector_name: '',
  date: new Date().toISOString().slice(0, 16),
  payment_id: ''
})



// Format helpers
const formatCurrency = (amount) => {
  return Number(amount).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')
}

const formatDate = (date) => {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  })
}

onMounted(async () => {
  // get pin from local storage
  if(window && window.localStorage) {
    let pin = localStorage.getItem('user_pin')
    const user = await fetchLoggedInUser(pin)
    formData.value.collector_name = user.username
  }
})

// Watch for form changes to show/hide preview
const watchFormChanges = computed(() => ({
  name: formData.value.name,
  amount: formData.value.amount,
  taxType: formData.value.taxType,
  date: formData.value.date
}))

watch(watchFormChanges, () => {
  showPreview.value = Boolean(
    formData.value.name &&
    formData.value.amount &&
    formData.value.taxType &&
    formData.value.date
  )
}, { deep: true })

// Load tax types when component mounts
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

// Handle tax type selection
const handleTaxTypeChange = () => {
  const selectedTax = taxes.value.find(tax => tax.name === formData.value.taxType)
  if (selectedTax) {
    formData.value.amount = selectedTax.amount
  } else {
    formData.value.amount = ''
  }
}

// Form submission
const handleSubmit = async () => {
  try {
    isLoading.value = true
    
    // Validate phone number
    const { isValidInternationalPhone } = useSMS()
    if (!isValidInternationalPhone(formData.value.contact)) {
      const toast = useToast()
      toast.add({
        title: 'Error',
        description: 'Please enter a valid phone number',
        color: 'red'
      })
      return
    }
    
    const paymentData = {
      ...formData.value,
      payment_id: uuidv4(),
      timestamp: Date.now()
    }

    // Record the donation
    const result = await recordDonation(paymentData, 'user123')
    
    if (result.success) {
      // Print receipt
      await printReceipt(paymentData, '/images/ama_logo.png')
      
      // Send SMS
      await sendSMS(
        paymentData.name,
        paymentData.contact,
        paymentData.taxType,
        paymentData.date,
        paymentData.amount
      )
      
      // Reset form
      formData.value = {
        name: '',
        contact: '',
        taxType: '',
        amount: '',
        collector_name: '',
        date: new Date().toISOString().slice(0, 16),
        payment_id: ''
      }
      
      // Emit success
      emit('donation-added')
      
      const toast = useToast()
      toast.add({
        title: 'Success',
        description: 'Payment recorded successfully',
        color: 'green'
      })
    }
  } catch (err) {
    console.error('Error recording payment:', err)
    const toast = useToast()
    toast.add({
      title: 'Error',
      description: 'Failed to record payment',
      color: 'red'
    })
  } finally {
    isLoading.value = false
  }
}

// Initialize
onMounted(() => {
  loadTaxTypes()
})
</script>