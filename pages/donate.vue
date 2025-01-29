<template>
  <div class="min-h-screen p-2 bg-gray-50">
    <!-- Main Content Container -->
    <div class="p-2 max-w-[1920px] mx-auto">
      <!-- Stats Grid -->
      <div class="grid grid-cols-2 gap-2 mb-2">
        <!-- Stats Cards -->
        <div class="bg-white rounded p-2">
          <div class="flex items-center gap-2">
            <div class="p-1.5 bg-blue-100 rounded">
              <Icon name="lucide:dollar-sign" class="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p class="text-xs text-gray-600">Total</p>
              <p class="text-sm font-semibold">
                {{ formatCurrency(totalDonations) }}
              </p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded p-2">
          <div class="flex items-center gap-2">
            <div class="p-1.5 bg-green-100 rounded">
              <Icon name="lucide:users" class="h-4 w-4 text-green-600" />
            </div>
            <div>
              <p class="text-xs text-gray-600">Count</p>
              <p class="text-sm font-semibold">{{ donationsCount }}</p>
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- Table/Cards Section -->
    <div class="divide-y">
          <!-- Desktop Table Header (hidden on mobile) -->
          <div class="hidden sm:grid sm:grid-cols-6 sm:gap-4 p-2 bg-gray-50 text-sm font-medium text-gray-600">
            <div>Name</div>
            <div>Contact</div>
            <div>Amount</div>
            <div>Date</div>
            <div>Tax Type</div>
            <div>Collector</div>
          </div>

          <!-- Responsive Cards/Rows -->
          <div v-for="donation in paginatedDonations" :key="donation.payment_id" 
               class="relative hover:bg-gray-50">
            <!-- Mobile Card Layout -->
            <div class="sm:hidden p-2">
              <div class="flex justify-between items-start mb-1">
                <div class="font-medium text-sm">{{ donation.name }}</div>
                <button
                  @click.stop="openActionMenu(donation)"
                  class="p-1 text-gray-600 hover:bg-gray-100 rounded"
                >
                  <Icon name="lucide:more-vertical" class="h-4 w-4" />
                </button>
              </div>
              <div class="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                <div class="text-gray-600">Amount:</div>
                <div class="font-medium">{{ formatCurrency(donation.amount) }}</div>
                <div class="text-gray-600">Contact:</div>
                <div>{{ donation.contact }}</div>
                <div class="text-gray-600">Date:</div>
                <div>{{ formatDate(donation.date) }}</div>
                <div class="text-gray-600">Tax Type:</div>
                <div>{{ donation.taxType }}</div>
                <div class="text-gray-600">Collector:</div>
                <div>{{ donation.collector_name }}</div>
              </div>
            </div>

            <!-- Desktop Row Layout -->
            <div class="hidden sm:grid sm:grid-cols-6 sm:gap-4 p-2 items-center">
              <div class="text-sm">{{ donation.name }}</div>
              <div class="text-sm">{{ donation.contact }}</div>
              <div class="text-sm">{{ formatCurrency(donation.amount) }}</div>
              <div class="text-sm">{{ formatDate(donation.date) }}</div>
              <div class="text-sm">{{ donation.taxType }}</div>
              <div class="flex items-center justify-between">
                <span class="text-sm">{{ donation.collector_name }}</span>
                <button
                  @click.stop="openActionMenu(donation)"
                  class="p-1 text-gray-600 hover:bg-gray-100 rounded"
                >
                  <Icon name="lucide:more-vertical" class="h-4 w-4" />
                </button>
              </div>
            </div>

            <!-- Action Menu -->
            <div
              v-show="activeActionMenuId === donation.payment_id"
              class="absolute right-2 top-8 sm:top-2 w-48 bg-white rounded shadow-lg py-1 z-10"
            >
              <button
                @click="reprintReceipt(donation)"
                class="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
              >
                <Icon name="lucide:printer" class="h-4 w-4" />
                Print Receipt
              </button>
              <button
                @click="resendSMS(donation)"
                class="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
              >
                <Icon name="lucide:message-square" class="h-4 w-4" />
                Send SMS
              </button>
              <button
                @click="openUpdateModal(donation)"
                class="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
              >
                <Icon name="lucide:edit" class="h-4 w-4" />
                Edit
              </button>
              <button
                @click="deleteDonationRecord(donation)"
                class="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-red-600"
              >
                <Icon name="lucide:trash-2" class="h-4 w-4" />
                Delete
              </button>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div class="border-t p-2 flex items-center justify-between gap-2">
          <div class="flex items-center gap-2">
            <select
              v-model="itemsPerPage"
              class="px-2 py-1 text-sm border rounded"
            >
              <option :value="5">5</option>
              <option :value="10">10</option>
              <option :value="25">25</option>
              <option :value="50">50</option>
            </select>
            <span class="text-xs text-gray-600">
              {{ startIndex + 1 }}-{{ endIndex }} of {{ filteredDonations.length }}
            </span>
          </div>

          <div class="flex items-center gap-1">
            <button
              @click="currentPage--"
              :disabled="currentPage === 1"
              class="p-1 border rounded disabled:opacity-50"
            >
              <Icon name="lucide:chevron-left" class="h-4 w-4" />
            </button>
            <span class="text-xs text-gray-600 px-2">
              {{ currentPage }}/{{ totalPages }}
            </span>
            <button
              @click="currentPage++"
              :disabled="currentPage === totalPages"
              class="p-1 border rounded disabled:opacity-50"
            >
              <Icon name="lucide:chevron-right" class="h-4 w-4" />
            </button>
          </div>
        </div>

    <!-- Fixed Add Button -->
    <button
      @click="isAddModalOpen = true"
      class="fixed bottom-4 right-4 w-10 h-10 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 flex items-center justify-center"
    >
      <Icon name="lucide:plus" class="h-5 w-5" />
    </button>

    <!-- Modals -->
    <AddDonation
      v-if="isAddModalOpen"
      @donation-added="handleDonationAdded"
      @close="isAddModalOpen = false"
    />

    <updateDonation
      v-if="isUpdateModalOpen"
      :donation="selectedDonation"
      @donation-updated="handleDonationUpdated"
      @close="isUpdateModalOpen = false"
    />

    <!-- Export Menu -->
    <div
      v-if="isExportMenuOpen"
      class="fixed right-2 top-16 w-48 bg-white rounded shadow-lg py-1 z-50"
    >
      <button
        @click="downloadCSV"
        class="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
      >
        <Icon name="lucide:file-text" class="h-4 w-4" />
        Export CSV
      </button>
      <button
        @click="downloadPDF"
        class="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
      >
        <Icon name="lucide:file" class="h-4 w-4" />
        Export PDF
      </button>
    </div>

    <!-- Click Outside Handler -->
    <!-- <div
      v-if="isActionMenuOpen || isExportMenuOpen"
      class="fixed inset-0 z-40"
      @click="closeAllMenus"
    ></div> -->
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { useDebounceFn } from "@vueuse/core";
import AddDonation from "~/components/AddDonation.vue";
import updateDonation from "~/components/updateDonation.vue";

const { printReceipt } = useUtils();
const { sendSMS } = useSMS();
const { fetchDonationsByFilter, fetchDonations, deleteDonation } =
  useRealtimeDB();
const toast = useToast();

// State
const donations = ref([]);
const filteredDonations = ref([]);
const isLoading = ref(false);
const isAddModalOpen = ref(false);
const isUpdateModalOpen = ref(false);
const isExportMenuOpen = ref(false);
const selectedDonation = ref(null);
const currentPage = ref(1);
const itemsPerPage = ref(10);
const activeActionMenuId = ref(null);
const isActionMenuOpen = computed(() => activeActionMenuId.value !== null);

const filters = ref({
  search: "",
  taxType: "",
  collector: "",
  startDate: new Date().toISOString().split("T")[0],
  endDate: new Date().toISOString().split("T")[0],
});

// Constants
const tableHeaders = [
  { key: "name", label: "Name" },
  { key: "contact", label: "Contact" },
  { key: "amount", label: "Amount" },
  { key: "date", label: "Date" },
  { key: "taxType", label: "Tax Type", class: "hidden sm:table-cell" },
  { key: "collector_name", label: "Collector", class: "hidden sm:table-cell" },
];

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

const closeAllMenus = () => {
  activeActionMenuId.value = null;
  isExportMenuOpen.value = false;

  if (clickOutsideHandler) {
    document.removeEventListener("click", clickOutsideHandler);
    clickOutsideHandler = null;
  }
};

const setupClickOutsideHandler = () => {
  setTimeout(() => {
    clickOutsideHandler = (event) => {
      const target = event.target;
      const isDropdownTrigger = target.closest(".dropdown-trigger");
      const isDropdownMenu = target.closest(".dropdown-menu");

      if (!isDropdownTrigger && !isDropdownMenu) {
        closeAllMenus();
      }
    };
    document.addEventListener("click", clickOutsideHandler);
  }, 0);
};

const openActionMenu = (donation) => {
  isExportMenuOpen.value = false;

  if (activeActionMenuId.value === donation.payment_id) {
    activeActionMenuId.value = null;
    return;
  }

  activeActionMenuId.value = donation.payment_id;
  selectedDonation.value = donation;
  setupClickOutsideHandler();
};

const toggleExportMenu = () => {
  activeActionMenuId.value = null;
  isExportMenuOpen.value = !isExportMenuOpen.value;

  if (isExportMenuOpen.value) {
    setupClickOutsideHandler();
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

    results.sort((a, b) => new Date(b.date) - new Date(a.date));
    filteredDonations.value = results;
    currentPage.value = 1;
    closeAllMenus();
  } catch (error) {
    console.error("Error applying filters:", error);
    toast.add({
      title: "Error",
      description: "Failed to apply filters. Please try again.",
      color: "red",
    });
  } finally {
    isLoading.value = false;
  }
};

const debouncedFilter = useDebounceFn(() => {
  applyFilters();
}, 300);

const formatDate = (dateString) => {
  const options = {
    year: "numeric",
    month: "short",
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
  
  try {
    const result = await deleteDonation("user123", donation.payment_id);
    if (result.success) {
      await loadDonations();
      toast.add({
        title: "Success",
        description: "Payment record deleted successfully",
        color: "green",
      });
    }
  } catch (error) {
    console.error("Error deleting donation:", error);
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

  doc.setFontSize(16);
  doc.text("Payment Report", 14, 15);

  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 25);
  doc.text(`Total: ${formatCurrency(totalDonations.value)}`, 14, 30);
  doc.text(`Records: ${donationsCount.value}`, 14, 35);

  const headers = tableHeaders.map((h) => h.label);
  const data = filteredDonations.value.map((donation) => [
    donation.name,
    donation.contact,
    formatCurrency(donation.amount),
    formatDate(donation.date),
    donation.taxType,
    donation.collector_name,
  ]);

  doc.autoTable({
    head: [headers],
    body: data,
    startY: 45,
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: 255,
      fontSize: 8,
      fontStyle: "bold",
    },
    alternateRowStyles: { fillColor: [245, 247, 250] },
  });

  doc.save(`payments-${new Date().toISOString().split("T")[0]}.pdf`);
};

// Event Handlers
const handleDonationAdded = async () => {
  await loadDonations();
  isAddModalOpen.value = false;
  toast.add({
    title: "Success",
    description: "Payment recorded successfully",
    color: "green",
  });
};

const handleDonationUpdated = async () => {
  await loadDonations();
  isUpdateModalOpen.value = false;
  toast.add({
    title: "Success",
    description: "Payment updated successfully",
    color: "green",
  });
};

// Lifecycle Hooks
onMounted(() => {
  loadDonations();
});

onUnmounted(() => {
  if (clickOutsideHandler) {
    document.removeEventListener("click", clickOutsideHandler);
  }
});

// Page Meta
definePageMeta({
  title: "Payments Dashboard",
  description: "Track and manage tax payments",
  layout: "mainlayout",
});
</script>
