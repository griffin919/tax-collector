<template>
  <div class="p-6">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-semibold text-gray-900">Update Payment</h2>
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
          v-model="donationData.name"
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
          v-model="donationData.contact"
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
          v-model="donationData.taxType"
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
          v-model="donationData.date"
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
          v-model="donationData.amount"
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
          v-model="donationData.collector_name"
          type="text"
          placeholder="Enter collector's name"
          class="w-full px-4 py-2 bg-gray-50 border rounded-lg"
          readonly
        />
      </div>

      <!-- Submit Buttons -->
      <div class="flex justify-end gap-3 pt-4 border-t">
        <button
          type="button"
          @click="$emit('close')"
          class="px-4 py-2 border text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          :disabled="isLoading"
        >
          Cancel
        </button>
        <button
          type="button"
          class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
          :disabled="isLoading || !isFormValid"
          @click="handleSave(false)"
        >
          <Icon
            v-if="isLoading"
            name="lucide:loader"
            class="h-5 w-5 animate-spin"
          />
          <Icon v-else name="lucide:save" class="h-5 w-5" />
          Update
        </button>
        <button
          type="button"
          class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
          :disabled="isLoading || !isFormValid"
          @click="handleSave(true)"
        >
          <Icon
            v-if="isLoading"
            name="lucide:printer"
            class="h-5 w-5"
          />
          Update & Print
        </button>
      </div>
    </form>

    <!-- Preview -->
    <div v-if="showPreview" class="mt-6 border-t pt-6">
      <h3 class="text-lg font-medium mb-4">Preview</h3>
      
      <!-- Receipt Preview -->
      <div class="bg-gray-50 p-4 rounded-lg mb-4">
        <h4 class="font-medium mb-2">Receipt</h4>
        <div class="text-sm space-y-1">
          <p><span class="text-gray-600">Name:</span> {{ donationData.name }}</p>
          <p><span class="text-gray-600">Contact:</span> {{ donationData.contact }}</p>
          <p><span class="text-gray-600">Tax Type:</span> {{ donationData.taxType }}</p>
          <p><span class="text-gray-600">Amount:</span> GHS {{ formatCurrency(donationData.amount) }}</p>
          <p><span class="text-gray-600">Date:</span> {{ formatDate(donationData.date) }}</p>
          <p><span class="text-gray-600">Collector:</span> {{ donationData.collector_name }}</p>
        </div>
      </div>

      <!-- SMS Preview -->
      <div class="bg-gray-50 p-4 rounded-lg">
        <h4 class="font-medium mb-2">SMS Message</h4>
        <p class="text-sm text-gray-600">
          Dear {{ donationData.name }}, your payment has been updated. Current amount: GHS {{ formatCurrency(donationData.amount) }} for {{ donationData.taxType }} on {{ formatDate(donationData.date) }}. Thank you.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
const { updateDonation } = useRealtimeDB()
const { sendSMS } = useSMS()
const { printReceipt } = useUtils()
const { fetchTaxTypes } = useSettingsDB()

const props = defineProps({
  donation: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close', 'donation-updated'])
const { isLoading } = useRealtimeDB()

// Form state
const donationData = ref({ ...props.donation })
const shouldPrint = ref(false)
const taxes = ref([])
const showPreview = ref(false)

// Load tax types
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

// Form validation
const isFormValid = computed(() => {
  return donationData.value.name?.trim() &&
    donationData.value.contact?.trim() &&
    donationData.value.taxType?.trim() &&
    donationData.value.amount > 0 &&
    donationData.value.date &&
    donationData.value.collector_name?.trim()
})

// Watch for form changes to show/hide preview
const watchFormChanges = computed(() => ({
  name: donationData.value.name,
  amount: donationData.value.amount,
  taxType: donationData.value.taxType,
  date: donationData.value.date
}))

watch(watchFormChanges, () => {
  showPreview.value = Boolean(
    donationData.value.name &&
    donationData.value.amount &&
    donationData.value.taxType &&
    donationData.value.date
  )
}, { deep: true })

// Handle tax type selection
const handleTaxTypeChange = () => {
  const selectedTax = taxes.value.find(tax => tax.name === donationData.value.taxType)
  if (selectedTax) {
    donationData.value.amount = selectedTax.amount
  } else {
    donationData.value.amount = ''
  }
}

const handleSave = async (withPrint) => {
  shouldPrint.value = withPrint
  await handleSubmit()
}

const handleSubmit = async () => {
  try {
    // Validate phone number
    const { isValidInternationalPhone } = useSMS()
    if (!isValidInternationalPhone(donationData.value.contact)) {
      const toast = useToast()
      toast.add({
        title: 'Error',
        description: 'Please enter a valid phone number',
        color: 'red'
      })
      return
    }

    const result = await updateDonation(
      'user123',
      donationData.value.payment_id,
      donationData.value
    )

    if (result.success) {
      // Print receipt if requested
      if (shouldPrint.value) {
        const printSuccess = await printReceipt(
          donationData.value,
          '/images/ama_logo.png'
        )
        if (!printSuccess) {
          const toast = useToast()
          toast.add({
            title: 'Warning',
            description: 'Failed to print updated receipt',
            color: 'yellow'
          })
        }
      }

      // Send SMS notification for update
      const smsResult = await sendSMS(
        donationData.value.name,
        donationData.value.contact,
        donationData.value.taxType,
        donationData.value.date,
        donationData.value.amount,
        true // isUpdate flag
      )

      if (smsResult.success) {
        const toast = useToast()
        toast.add({
          title: 'Success',
          description: 'Update notification sent successfully',
          color: 'green'
        })
      }

      // Close modal and notify parent
      emit('donation-updated')
      emit('close')

      // Show success message
      const toast = useToast()
      toast.add({
        title: 'Success',
        description: shouldPrint.value 
          ? 'Payment updated and receipt printed' 
          : 'Payment updated successfully',
        color: 'green'
      })
    }
  } catch (error) {
    console.error('Failed to update:', error)
    const toast = useToast()
    toast.add({
      title: 'Error',
      description: 'Failed to update payment',
      color: 'red'
    })
  }
}

// Initialize
onMounted(async () => {
  await loadTaxTypes()
  
  
})
</script>