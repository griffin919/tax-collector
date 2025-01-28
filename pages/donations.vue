# pages/donations.vue
<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Main Content Container -->
    <div class="p-4 lg:p-6 max-w-[1920px] mx-auto">
      <!-- Stats Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <!-- Total Amount Card -->
        <div class="bg-white rounded-lg p-4 shadow-sm">
          <div class="flex items-center gap-3">
            <div class="p-2 bg-blue-100 rounded-lg">
              <Icon name="lucide:dollar-sign" class="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p class="text-sm text-gray-600">Total Payments</p>
              <p class="text-xl font-semibold">{{ formatCurrency(totalDonations) }}</p>
            </div>
          </div>
        </div>
        
        <!-- Total Count Card -->
        <div class="bg-white rounded-lg p-4 shadow-sm">
          <div class="flex items-center gap-3">
            <div class="p-2 bg-green-100 rounded-lg">
              <Icon name="lucide:users" class="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p class="text-sm text-gray-600">Payment Count</p>
              <p class="text-xl font-semibold">{{ donationsCount }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Filters Section -->
      <div class="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div class="flex flex-col lg:flex-row gap-4">
          <!-- Search Input -->
          <div class="w-full lg:w-64">
            <div class="relative">
              <Icon 
                name="lucide:search" 
                class="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <input
                v-model="filters.search"
                type="text"
                placeholder="Search payments..."
                @input="debouncedFilter"
                class="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <!-- Filters Group -->
          <div class="flex flex-col sm:flex-row gap-4 flex-grow">
            <!-- Tax Type Select -->
            <select
              v-model="filters.taxType"
              @change="applyFilters"
              class="w-full sm:w-48 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="">All Tax Types</option>
              <option 
                v-for="type in uniqueTaxTypes" 
                :key="type.value" 
                :value="type.value"
              >
                {{ type.label }}
              </option>
            </select>
            
            <!-- Collector Select -->
            <select
              v-model="filters.collector"
              @change="applyFilters"
              class="w-full sm:w-48 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="">All Collectors</option>
              <option 
                v-for="collector in uniqueCollectors" 
                :key="collector.value" 
                :value="collector.value"
              >
                {{ collector.label }}
              </option>
            </select>

            <!-- Date Range Inputs -->
            <div class="flex gap-2 flex-grow">
              <input
                v-model="filters.startDate"
                type="date"
                class="w-full sm:w-auto px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <input
                v-model="filters.endDate"
                type="date"
                class="w-full sm:w-auto px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <button
                @click="applyFilters"
                class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                :disabled="isLoading"
              >
                <Icon
                  v-if="isLoading"
                  name="lucide:loader"
                  class="h-5 w-5 animate-spin"
                />
                <Icon v-else name="lucide:filter" class="h-5 w-5" />
                Filter
              </button>
            </div>
          </div>

          <!-- Actions Group -->
          <div class="flex gap-2 justify-end">
            <!-- Export Dropdown -->
            <div class="relative">
              <button
  @click.stop="toggleExportMenu"
  class="px-4 py-2 border text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 dropdown-trigger"
>
  <Icon name="lucide:download" class="h-5 w-5" />
  Export
</button>
              
              <!-- Export Menu -->
              <div
                v-if="isExportMenuOpen"
                class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-10"
              >
                <button
                  @click="downloadCSV"
                  class="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
                >
                  <Icon name="lucide:file-text" class="h-4 w-4" />
                  Export as CSV
                </button>
                <button
                  @click="downloadPDF"
                  class="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
                >
                  <Icon name="lucide:file" class="h-4 w-4" />
                  Export as PDF
                </button>
              </div>
            </div>
            
            <!-- Refresh Button -->
            <button
              @click="loadDonations"
              class="p-2 border text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              :disabled="isLoading"
            >
              <Icon
                v-if="isLoading"
                name="lucide:loader"
                class="h-5 w-5 animate-spin"
              />
              <Icon v-else name="lucide:refresh-cw" class="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <!-- Table Section -->
      <div class="bg-white rounded-lg shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b">
                <th
                  v-for="header in tableHeaders"
                  :key="header.key"
                  class="text-left py-3 px-4 text-sm font-medium text-gray-600"
                >
                  {{ header.label }}
                </th>
                <th class="w-10"></th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="donation in paginatedDonations"
                :key="donation.payment_id"
                class="border-b last:border-0 hover:bg-gray-50"
              >
                <td class="py-2 px-4 text-sm">{{ donation.name }}</td>
                <td class="py-2 px-4 text-sm">{{ donation.contact }}</td>
                <td class="py-2 px-4 text-sm">{{ formatCurrency(donation.amount) }}</td>
                <td class="py-2 px-4 text-sm">{{ formatDate(donation.date) }}</td>
                <td class="py-2 px-4 text-sm">{{ donation.taxType }}</td>
                <td class="py-2 px-4 text-sm">{{ donation.collector_name }}</td>
                <td class="py-2 px-4">
                  <div class="relative">
                    <button
  @click.stop="openActionMenu(donation)"
  class="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors dropdown-trigger"
>
  <Icon name="lucide:more-vertical" class="h-5 w-5" />
</button>
                    
                    <!-- Action Menu -->
                    <div
  v-show="activeActionMenuId === donation.payment_id"
  class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-10 dropdown-menu"
>
                      <button
                        @click="reprintReceipt(donation)"
                        class="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
                      >
                        <Icon name="lucide:printer" class="h-4 w-4" />
                        Reprint Receipt
                      </button>
                      <button
                        @click="resendSMS(donation)"
                        class="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
                      >
                        <Icon name="lucide:message-square" class="h-4 w-4" />
                        Resend SMS
                      </button>
                      <button
                        @click="openUpdateModal(donation)"
                        class="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
                      >
                        <Icon name="lucide:edit" class="h-4 w-4" />
                        Edit
                      </button>
                      <button
                        @click="deleteDonationRecord(donation)"
                        class="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-red-600"
                      >
                        <Icon name="lucide:trash-2" class="h-4 w-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 border-t">
          <div class="flex items-center gap-2 w-full sm:w-auto">
            <select
              v-model="itemsPerPage"
              class="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none w-32"
            >
              <option :value="5">5 per page</option>
              <option :value="10">10 per page</option>
              <option :value="25">25 per page</option>
              <option :value="50">50 per page</option>
            </select>
            <span class="text-sm text-gray-600 hidden sm:inline">
              {{ startIndex + 1 }}-{{ endIndex }} of {{ filteredDonations.length }}
            </span>
          </div>

          <div class="flex items-center gap-2">
            <button
              @click="currentPage--"
              :disabled="currentPage === 1"
              class="px-3 py-1 border rounded-lg disabled:opacity-50 flex items-center gap-1"
            >
              <Icon name="lucide:chevron-left" class="h-4 w-4" />
              <span class="hidden sm:inline">Previous</span>
            </button>
            <span class="text-sm text-gray-600">
              {{ currentPage }} / {{ totalPages }}
            </span>
            <button
              @click="currentPage++"
              :disabled="currentPage === totalPages"
              class="px-3 py-1 border rounded-lg disabled:opacity-50 flex items-center gap-1"
            >
              <span class="hidden sm:inline">Next</span>
              <Icon name="lucide:chevron-right" class="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Fixed Add Button -->
    <button
      @click="isAddModalOpen = true"
      class="fixed bottom-6 right-6 w-12 h-12 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-colors flex items-center justify-center"
    >
      <Icon name="lucide:plus" class="h-6 w-6" />
    </button>

    <!-- Modals -->
    <!-- Add Payment Modal -->
    <div v-if="isAddModalOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full">
        <AddDonation 
          @donation-added="handleDonationAdded" 
          @close="isAddModalOpen = false" 
        />
      </div>
    </div>

    <!-- Update Payment Modal -->
    <div v-if="isUpdateModalOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full">
        <UpdateDonation
          :donation="selectedDonation"
          @donation-updated="handleDonationUpdated"
          @close="isUpdateModalOpen = false"
        />
      </div>
    </div>

    <!-- Click Outside Handler -->
    <div 
      v-if="isActionMenuOpen || isExportMenuOpen"
      class="fixed inset-0 z-40"
      @click="closeAllMenus"
    ></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { useDebounceFn } from "@vueuse/core";

const { printReceipt } = useUtils();
const { sendSMS } = useSMS();
const { fetchDonationsByFilter, fetchDonations, deleteDonation } = useRealtimeDB();

// State
const donations = ref([]);
const filteredDonations = ref([]);
const isLoading = ref(false);
const isAddModalOpen = ref(false);
const isUpdateModalOpen = ref(false);


// =========================


const isActionMenuOpen = ref(false);
const isExportMenuOpen = ref(false);
const selectedDonation = ref(null);
const currentPage = ref(1);
const itemsPerPage = ref(10);
const filters = ref({
  search: "",
  taxType: "",
  collector: "",
  startDate: new Date().toISOString().split("T")[0],
  endDate: new Date().toISOString().split("T")[0],
});
const activeActionMenuId = ref(null);


// Constants
const tableHeaders = [
  { key: "name", label: "Name" },
  { key: "contact", label: "Contact" },
  { key: "amount", label: "Amount" },
  { key: "date", label: "Date" },
  { key: "taxType", label: "Tax Type" },
  { key: "collector_name", label: "Collector" },
];


// Update closeAllMenus function
const closeAllMenus = () => {
  activeActionMenuId.value = null;
  isExportMenuOpen.value = false;
  
  if (clickOutsideHandler) {
    document.removeEventListener('click', clickOutsideHandler);
    clickOutsideHandler = null;
  }
};

// Clean up on component unmount
onUnmounted(() => {
  if (clickOutsideHandler) {
    document.removeEventListener('click', clickOutsideHandler);
  }
});
// Computed Properties
const uniqueTaxTypes = computed(() => {
  const types = [...new Set(donations.value.map((d) => d.taxType))];
  return types.map((type) => ({ value: type, label: type }));
});

const uniqueCollectors = computed(() => {
  const collectors = [...new Set(donations.value.map((d) => d.collector_name))];
  return collectors.map((collector) => ({
    value: collector,
    label: collector,
  }));
});

const totalDonations = computed(() => {
  return filteredDonations.value.reduce(
    (total, donation) => total + parseFloat(donation.amount || 0),
    0
  );
});

const donationsCount = computed(() => filteredDonations.value.length);

const totalPages = computed(() =>
  Math.ceil(filteredDonations.value.length / itemsPerPage.value)
);

const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage.value);

const endIndex = computed(() =>
  Math.min(
    startIndex.value + itemsPerPage.value,
    filteredDonations.value.length
  )
);

const paginatedDonations = computed(() =>
  filteredDonations.value.slice(startIndex.value, endIndex.value)
);

// Methods
let clickOutsideHandler = null;

// Update the openActionMenu function
const openActionMenu = (donation) => {
  // Close export menu first
  isExportMenuOpen.value = false;
  
  // If clicking the same menu, close it
  if (activeActionMenuId.value === donation.payment_id) {
    activeActionMenuId.value = null;
    return;
  }

  // Open new menu
  activeActionMenuId.value = donation.payment_id;
  selectedDonation.value = donation;

  // Set up click outside handler
  setTimeout(() => {
    clickOutsideHandler = (event) => {
      const target = event.target;
      const isDropdownTrigger = target.closest('.dropdown-trigger');
      const isDropdownMenu = target.closest('.dropdown-menu');
      
      if (!isDropdownTrigger && !isDropdownMenu) {
        closeAllMenus();
      }
    };
    document.addEventListener('click', clickOutsideHandler);
  }, 0);
};

// Add toggle function for export menu
const toggleExportMenu = () => {
  // Close action menu first
  activeActionMenuId.value = null;
  
  isExportMenuOpen.value = !isExportMenuOpen.value;

  if (isExportMenuOpen.value) {
    setTimeout(() => {
      clickOutsideHandler = (event) => {
        const target = event.target;
        const isDropdownTrigger = target.closest('.dropdown-trigger');
        const isDropdownMenu = target.closest('.dropdown-menu');
        
        if (!isDropdownTrigger && !isDropdownMenu) {
          closeAllMenus();
        }
      };
      document.addEventListener('click', clickOutsideHandler);
    }, 0);
  }
};

const loadDonations = async () => {
  isLoading.value = true;
  try {
    const donationsData = await fetchDonations("user123");
    donations.value = donationsData;
    await applyFilters();
  } catch (error) {
    console.error("Error loading donations:", error);
    const toast = useToast();
    toast.add({
      title: "Error",
      description: "Failed to load donations. Please try again.",
      color: "red",
    });
  } finally {
    isLoading.value = false;
  }
};

const applyFilters = async () => {
  isLoading.value = true;
  try {
    const filterParams = {
      startDate: filters.value.startDate,
      endDate: filters.value.endDate,
      taxType: { value: filters.value.taxType },
      collector_name: { value: filters.value.collector },
    };

    let results = await fetchDonationsByFilter("user123", filterParams);

    // Apply search filter locally
    if (filters.value.search) {
      const searchTerm = filters.value.search.toLowerCase();
      results = results.filter(
        (item) =>
          item.name?.toLowerCase().includes(searchTerm) ||
          item.taxType?.toLowerCase().includes(searchTerm) ||
          item.collector_name?.toLowerCase().includes(searchTerm) ||
          item.contact?.includes(searchTerm)
      );
    }

    // Sort by date descending
    results.sort((a, b) => new Date(b.date) - new Date(a.date));

    filteredDonations.value = results;
    currentPage.value = 1;
    closeAllMenus();
  } catch (error) {
    console.error("Error applying filters:", error);
    const toast = useToast();
    toast.add({
      title: "Error",
      description: "Failed to apply filters. Please try again.",
      color: "red",
    });
  } finally {
    isLoading.value = false;
  }
};

// Debounced search
const debouncedFilter = useDebounceFn(() => {
  applyFilters();
}, 300);

const formatDate = (dateString) => {
  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  };
  return new Date(dateString).toLocaleString(undefined, options);
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "GHS",
  }).format(amount);
};

// Action Handlers
const reprintReceipt = async (donation) => {
  closeAllMenus();
  const printSuccess = await printReceipt(donation, "/images/logo.png");
  const toast = useToast();

  if (printSuccess) {
    toast.add({
      title: "Success",
      description: "Receipt printed successfully",
      color: "green",
    });
  } else {
    toast.add({
      title: "Error",
      description: "Failed to print receipt",
      color: "red",
    });
  }
};

const resendSMS = async (donation) => {
  closeAllMenus();
  const result = await sendSMS(
    donation.name,
    donation.contact,
    donation.taxType,
    donation.date,
    donation.amount
  );

  const toast = useToast();
  if (result.success) {
    toast.add({
      title: "Success",
      description: "SMS sent successfully",
      color: "green",
    });
  } else {
    toast.add({
      title: "Error",
      description: result.message || "Failed to send SMS",
      color: "red",
    });
  }
};

const openUpdateModal = (donation) => {
  selectedDonation.value = donation;
  isUpdateModalOpen.value = true;
  closeAllMenus();
};

const deleteDonationRecord = async (donation) => {
  closeAllMenus();
  const confirmed = await $confirm({
    title: "Delete Payment",
    content: "Are you sure you want to delete this payment record? This action cannot be undone.",
    confirmLabel: "Delete",
    cancelLabel: "Cancel",
    type: "danger",
  });

  if (!confirmed) return;

  try {
    const result = await deleteDonation("user123", donation.payment_id);
    if (result.success) {
      await loadDonations();
      const toast = useToast();
      toast.add({
        title: "Success",
        description: "Payment record deleted successfully",
        color: "green",
      });
    }
  } catch (error) {
    console.error("Error deleting donation:", error);
    const toast = useToast();
    toast.add({
      title: "Error",
      description: "Failed to delete payment record",
      color: "red",
    });
  }
};

// Export Functions
const downloadCSV = () => {
  closeAllMenus();
  const headers = tableHeaders.map((h) => h.label).join(",");
  const rows = filteredDonations.value.map((donation) =>
    [
      donation.name,
      donation.contact,
      donation.amount,
      formatDate(donation.date),
      donation.taxType,
      donation.collector_name,
    ].join(",")
  );

  const csvContent = [headers, ...rows].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute(
    "download",
    `payments-${new Date().toISOString().split("T")[0]}.csv`
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

const downloadPDF = () => {
  closeAllMenus();
  const doc = new jsPDF();

  // Add title
  doc.setFontSize(20);
  doc.text("Payment Report", 14, 15);

  // Add metadata
  doc.setFontSize(10);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 25);
  doc.text(`Total Payments: ${formatCurrency(totalDonations.value)}`, 14, 30);
  doc.text(`Number of Records: ${donationsCount.value}`, 14, 35);

  // Prepare table data
  const headers = tableHeaders.map((h) => h.label);
  const data = filteredDonations.value.map((donation) => [
    donation.name,
    donation.contact,
    formatCurrency(donation.amount),
    formatDate(donation.date),
    donation.taxType,
    donation.collector_name,
  ]);

  // Add table
  doc.autoTable({
    head: [headers],
    body: data,
    startY: 45,
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: 255,
      fontSize: 8,
      fontStyle: "bold",
    },
    alternateRowStyles: { fillColor: [245, 247, 250] },
  });

  // Save PDF
  doc.save(`payments-${new Date().toISOString().split("T")[0]}.pdf`);
};

// Event Handlers
const handleDonationAdded = async () => {
  await loadDonations();
  isAddModalOpen.value = false;
  const toast = useToast();
  toast.add({
    title: "Success",
    description: "Payment recorded successfully",
    color: "green",
  });
};

const handleDonationUpdated = async () => {
  await loadDonations();
  isUpdateModalOpen.value = false;
  const toast = useToast();
  toast.add({
    title: "Success",
    description: "Payment updated successfully",
    color: "green",
  });
};

// Initialize
onMounted(() => {
  loadDonations();
});



// Page Meta
definePageMeta({
  title: "Payments Dashboard",
  description: "Track and manage tax payments",
  layout: "mainlayout",
});
</script>