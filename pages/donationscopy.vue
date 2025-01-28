<template>
  <div class="p-6 mx-auto space-y-6 relative min-h-screen">
    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="bg-blue-50 rounded-lg p-6">
        <div class="flex items-center gap-4">
          <div class="p-3 bg-blue-100 rounded-full">
            <Icon name="lucide:dollar-sign" class="h-6 w-6 text-blue-500" />
          </div>
          <div>
            <p class="text-sm text-gray-600">Total Payments</p>
            <p class="text-2xl font-semibold">
              {{ formatCurrency(totalDonations) }}
            </p>
          </div>
        </div>
      </div>

      <div class="bg-green-50 rounded-lg p-6">
        <div class="flex items-center gap-4">
          <div class="p-3 bg-green-100 rounded-full">
            <Icon name="lucide:users" class="h-6 w-6 text-green-500" />
          </div>
          <div>
            <p class="text-sm text-gray-600">Total Payments</p>
            <p class="text-2xl font-semibold">{{ donationsCount }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters Section -->
    <div class="flex space-x-4 justify-content-around gap-4 w-full">
      <!-- Search Input -->
      <div class="relative flex-grow sm:flex-grow-0 sm:w-64 w-1/5">
        <Icon
          name="lucide:search"
          class="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2"
        />
        <!-- <input
          v-model="filters.search"
          type="text"
          placeholder="Search payments..."
          class="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          @input="debouncedFilter"
        /> -->
        <UInput
          v-model="filters.search"
          placeholder="Search payments..."
          class="w-full"
          @update:modelValue="debouncedFilter"
        >
          <template #prepend>
            <Icon name="lucide:search" class="h-5 w-5 text-gray-400" />
          </template>
        </UInput>
      </div>

      <div class="flex gap-2 w-3/5 justify-center">
        <!-- Tax Type Filter -->
        <USelectMenu
          v-model="filters.taxType"
          :options="uniqueTaxTypes"
          placeholder="Filter by Tax Type"
          option-attribute="label"
          searchable
          class="w-2/3 sm:w-48 "
          @update:modelValue="applyFilters"
        >
          <template #prepend>
            <Icon name="lucide:tag" class="h-4 w-4 text-gray-500" />
          </template>
        </USelectMenu>

        <!-- Collector Filter -->
        <USelectMenu
          v-model="filters.collector"
          :options="uniqueCollectors"
          placeholder="Filter by Collector"
          option-attribute="label"
          searchable
          class="w-full sm:w-48"
          @update:modelValue="applyFilters"
        >
          <template #prepend>
            <Icon name="lucide:user" class="h-4 w-4 text-gray-500" />
          </template>
        </USelectMenu>

        <!-- Date Range -->
        <div class="flex gap-2">
          <UFormGroup>
            <UInput v-model="filters.startDate" type="date" class="w-full" />
          </UFormGroup>

          <UFormGroup>
            <UInput v-model="filters.endDate" type="date" class="w-full" />
          </UFormGroup>

          <UButton color="primary" @click="applyFilters" :loading="isLoading">
            <Icon name="lucide:filter" class="h-5 w-5" />
            <span class="ml-2">Apply Filters</span>
          </UButton>
        </div>
      </div>

      <!-- Download Options -->
      <div class="flex items-center gap-4 justify-end w-1/5">
        <div class="relative ml-auto">
          <UDropdown
            :items="downloadOptions"
            :popper="{ placement: 'bottom-end' }"
          >
            <UButton color="gray" class="flex items-center gap-2">
              <Icon name="lucide:download" class="h-5 w-5" />
              <span>Export</span>
            </UButton>
          </UDropdown>
        </div>

        <!-- Refresh Button -->
        <UButton
          color="white"
          class="flex items-center gap-2"
          :loading="isLoading"
          @click="loadDonations"
        >
          <Icon name="lucide:refresh-cw" class="h-5 w-5" />
        </UButton>
      </div>
    </div>

    <!-- Content Section -->
    <div v-if="isLoading" class="flex justify-center py-8">
      <Icon name="lucide:loader" class="h-8 w-8 text-blue-500 animate-spin" />
    </div>

    <template v-else>
      <!-- Donations Table -->
      <div v-if="paginatedDonations.length" class="bg-white rounded-lg shadow">
        <!-- Desktop Table View -->
        <div class="hidden md:block overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b">
                <th
                  v-for="header in tableHeaders"
                  :key="header.key"
                  class="text-left py-3 px-4 font-medium text-gray-600"
                >
                  {{ header.label }}
                </th>
                <th class="w-16"></th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(donation, index) in paginatedDonations"
                :key="donation.payment_id"
                class="border-b last:border-0 hover:bg-gray-50"
              >
                <td class="py-3 px-4">
                  {{ (currentPage - 1) * itemsPerPage + index + 1 }}.
                  {{ donation.name }}
                </td>
                <td class="py-3 px-4">{{ donation.contact }}</td>
                <td class="py-3 px-4">
                  {{ formatCurrency(donation.amount) }}
                </td>
                <td class="py-3 px-4">
                  {{ formatDate(donation.date) }}
                </td>
                <td class="py-3 px-4">
                  {{ donation.taxType }}
                </td>
                <td class="py-3 px-4">
                  {{ donation.collector_name }}
                </td>
                <td class="py-3 px-4">
                  <UDropdown
                    :items="getActionItems(donation)"
                    :popper="{ placement: 'bottom-end' }"
                  >
                    <UButton color="gray" variant="ghost" class="h-8 w-8 p-0">
                      <Icon name="lucide:more-vertical" class="h-4 w-4" />
                    </UButton>
                  </UDropdown>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Mobile Card View -->
        <div class="md:hidden divide-y divide-gray-200">
          <div
            v-for="(donation, index) in paginatedDonations"
            :key="donation.payment_id"
            class="p-4 hover:bg-gray-50"
          >
            <div class="flex justify-between items-start mb-2">
              <div>
                <h3 class="text-lg font-medium text-gray-900">
                  {{ donation.name }}
                </h3>
                <p class="text-sm text-gray-500">{{ donation.contact }}</p>
              </div>
              <UDropdown
                :items="getActionItems(donation)"
                :popper="{ placement: 'bottom-end' }"
              >
                <UButton color="gray" variant="ghost" class="h-8 w-8 p-0">
                  <Icon name="lucide:more-vertical" class="h-4 w-4" />
                </UButton>
              </UDropdown>
            </div>

            <div class="space-y-2 mt-3">
              <div class="flex justify-between text-sm">
                <span class="text-gray-500">Amount:</span>
                <span class="font-medium">
                  {{ formatCurrency(donation.amount) }}
                </span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-gray-500">Date:</span>
                <span class="font-medium">
                  {{ formatDate(donation.date) }}
                </span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-gray-500">Tax Type:</span>
                <span class="font-medium">{{ donation.taxType }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div class="flex items-center justify-between px-4 py-3 border-t">
          <div class="flex items-center gap-2">
            <USelect
              v-model="itemsPerPage"
              :options="[
                { label: '5 per page', value: 5 },
                { label: '10 per page', value: 10 },
                { label: '25 per page', value: 25 },
                { label: '50 per page', value: 50 },
              ]"
              class="w-40"
            />
            <span class="text-sm text-gray-600">
              Showing {{ startIndex + 1 }} to {{ endIndex }} of
              {{ filteredDonations.length }}
            </span>
          </div>

          <div class="flex items-center gap-2">
            <UButton
              color="gray"
              :disabled="currentPage === 1"
              @click="currentPage--"
            >
              <Icon name="lucide:chevron-left" class="h-4 w-4" />
            </UButton>
            <span class="text-sm text-gray-600">
              Page {{ currentPage }} of {{ totalPages }}
            </span>
            <UButton
              color="gray"
              :disabled="currentPage === totalPages"
              @click="currentPage++"
            >
              <Icon name="lucide:chevron-right" class="h-4 w-4" />
            </UButton>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-12 bg-gray-50 rounded-lg">
        <Icon
          name="lucide:inbox"
          class="h-12 w-12 text-gray-400 mx-auto mb-4"
        />
        <h3 class="text-lg font-medium text-gray-900">No payments found</h3>
        <p class="mt-1 text-gray-500">
          {{
            donations.length === 0
              ? "Click the refresh button to load payments."
              : "Try adjusting your search criteria."
          }}
        </p>
      </div>
    </template>

    <!-- Modals -->
    <UModal v-model="isAddModalOpen">
      <AddDonation @donation-added="handleDonationAdded" />
    </UModal>

    <UModal v-model="isUpdateModalOpen">
      <UpdateDonation
        :donation="selectedDonation"
        @donation-updated="handleDonationUpdated"
      />
    </UModal>

    <!-- Floating Add Button -->
    <UButton
      color="primary"
      class="fixed bottom-8 right-8 h-16 w-16 rounded-full p-0 shadow-lg"
      @click="isAddModalOpen = true"
    >
      <Icon name="lucide:plus" class="h-8 w-8" />
    </UButton>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { useDebounceFn } from "@vueuse/core";

const { printReceipt } = useUtils();
const { sendSMS } = useSMS();
const { fetchDonationsByFilter, fetchDonations, deleteDonation } =
  useRealtimeDB();

// State
const donations = ref([]);
const filteredDonations = ref([]);
const isLoading = ref(false);
const isAddModalOpen = ref(false);
const isUpdateModalOpen = ref(false);
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

// Constants
const tableHeaders = [
  { key: "name", label: "Name" },
  { key: "contact", label: "Contact" },
  { key: "amount", label: "Amount" },
  { key: "date", label: "Date" },
  { key: "taxType", label: "Tax Type" },
  { key: "collector_name", label: "Collector" },
];

// Computed Properties
const uniqueTaxTypes = computed(() => {
  const types = [...new Set(donations.value.map((d) => d.taxType))];
  return [
    { value: "", label: "All Tax Types" },
    ...types.map((type) => ({ value: type, label: type })),
  ];
});

const uniqueCollectors = computed(() => {
  const collectors = [...new Set(donations.value.map((d) => d.collector_name))];
  return [
    { value: "", label: "All Collectors" },
    ...collectors.map((collector) => ({
      value: collector,
      label: collector,
    })),
  ];
});

const totalDonations = computed(() => {
  return filteredDonations.value.reduce(
    (total, donation) => total + donation.amount,
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

const downloadOptions = computed(() => [
  {
    label: "Export as CSV",
    icon: "lucide:file-text",
    click: downloadCSV,
  },
  {
    label: "Export as PDF",
    icon: "lucide:file",
    click: downloadPDF,
  },
]);

// Methods
const getActionItems = (donation) => [
  {
    label: "Reprint Receipt",
    icon: "lucide:printer",
    click: () => reprintReceipt(donation),
  },
  {
    label: "Resend SMS",
    icon: "lucide:message-square",
    click: () => resendSMS(donation),
  },
  {
    label: "Edit",
    icon: "lucide:edit",
    click: () => openUpdateModal(donation),
  },
  {
    label: "Delete",
    icon: "lucide:trash-2",
    color: "red",
    click: () => deleteDonationRecord(donation),
  },
];

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
          item.collector_name?.toLowerCase().includes(searchTerm)
      );
    }

    // Sort by date descending
    results.sort((a, b) => new Date(b.date) - new Date(a.date));

    filteredDonations.value = results;
    currentPage.value = 1;
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
};

const deleteDonationRecord = async (donation) => {
  const confirmed = await $confirm({
    title: "Delete Payment",
    content:
      "Are you sure you want to delete this payment record? This action cannot be undone.",
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
