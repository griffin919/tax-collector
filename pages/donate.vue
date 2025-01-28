<template>
    <div class="p-6 max-w-6xl mx-auto space-y-6 relative min-h-screen">
      <div
        class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-5"
      >
        <!-- <div class="flex justify-between gap-2 sm:gap-4">
          <div>
            <h2 class="text-2xl font-semibold">Dashboard</h2>
          </div>
        </div> -->
  
        <!-- Search and Actions -->
        <div
          class="w-full flex justify-between gap-4 sm:flex-row sm:items-center"
        >
          <div class="relative w-full sm:w-64">
            <Icon
              name="lucide:search"
              class="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2"
            />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search tax payments..."
              class="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
  
          <div class="flex">
            <!-- Download Dropdown -->
            <!-- <div class="relative ">
            <button
              @click="toggleDownloadMenu"
              class="px-2 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
            >
              <Icon name="lucide:download" class="h-5 w-5" />
            </button>
            
  
             <div
              v-if="showDownloadMenu"
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
          </div> -->
            <div class="pl-2">
              <button
                @click="loadDonations"
                class="px-2 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
              >
                <Icon name="lucide:refresh-cw" class="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
  
      <!-- Loading State -->
      <div v-if="isLoading" class="flex justify-center py-8">
        <Icon name="lucide:loader" class="h-8 w-8 text-blue-500 animate-spin" />
      </div>
  
      <!-- Error State -->
      <div v-else-if="error" class="bg-red-50 p-4 rounded-lg text-red-600">
        {{ error }}
        <button
          @click="loadDonations"
          class="ml-2 text-red-700 underline hover:no-underline"
        >
          Retry
        </button>
      </div>
  
      <template v-else>
        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- <div class="bg-blue-50 rounded-lg p-6">
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
          </div> -->
  
          <div class="bg-green-50 rounded-lg p-6">
            <div class="flex items-center gap-4">
              <div class="p-3 bg-green-100 rounded-full">
                <Icon name="lucide:users" class="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p class="text-sm text-gray-600">Total Payments</p>
                <p class="text-2xl font-semibold">{{ donotionsCount }}</p>
              </div>
            </div>
          </div>
        </div>
  
        <!-- Donations Table -->
        <div v-if="filteredDonations.length" class="bg-white rounded-lg shadow">
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
                  <th></th>
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
                    <div class="flex items-center gap-1">
                      {{ formatCurrency(donation.amount) }}
                    </div>
                  </td>
                  <td class="py-3 px-4">
                    <div class="flex items-center gap-1">
                      {{ formatDate(donation.date) }}
                    </div>
                  </td>
                  <td class="py-3 px-4">
                    <div class="flex items-center gap-1">
                      {{ donation.taxType }}
                    </div>
                  </td>
                  <td class="py-3 px-4">
                    <div class="flex items-center gap-1">
                      <!-- <Icon
                        name="lucide:more-vertical"
                        class="h-4 w-4 text-gray-400 cursor-pointer"
                        @click="handleRowClick(donation)"
                      /> -->

                      <span>
                      <svg xmlns="http://www.w3.org/2000/svg"  color="gray"   @click="handleRowClick(donation)" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-ellipsis-vertical"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
                    </span>
                    </div>
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
                    {{ (currentPage - 1) * itemsPerPage + index + 1 }}.
                    {{ donation.name }}
                  </h3>
                  <p class="text-sm text-gray-500">{{ donation.contact }}</p>
                </div>
                <button
                  @click="handleRowClick(donation)"
                  class="p-2 hover:bg-gray-100 rounded-full"
                >
                  <!-- <Icon
                    name="lucide:more-vertical"
                    class="h-5 w-5 text-gray-400"
                  /> -->
                  <span>
                      <svg xmlns="http://www.w3.org/2000/svg"  color="gray" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-ellipsis-vertical"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
                    </span>
                </button>
              </div>
  
              <div class="space-y-2 mt-3">
                <div class="flex items-center gap-2 text-sm">
                  <div class="flex items-center gap-1 text-gray-500">
                    <span>Amount:</span>
                  </div>
                  <span class="font-medium">{{
                    formatCurrency(donation.amount)
                  }}</span>
                </div>
  
                <div class="flex items-center gap-2 text-sm">
                  <div class="flex items-center gap-1 text-gray-500">
                    <span>Date:</span>
                  </div>
                  <span class="font-medium">{{ formatDate(donation.date) }}</span>
                </div>
  
                <div class="flex items-center gap-2 text-sm">
                  <div class="flex items-center gap-1 text-gray-500">
                    <span>Tax Type:</span>
                  </div>
                  <span class="font-medium">{{ donation.taxType }}</span>
                </div>
              </div>
            </div>
          </div>
  
          <!-- Responsive Pagination -->
          <div
            class="flex flex-col sm:flex-row sm:items-center sm:justify-between px-4 py-3 border-t gap-4"
          >
            <div class="flex flex-col sm:flex-row sm:items-center gap-2">
              <select
                v-model="itemsPerPage"
                class="border rounded-lg px-2 py-1 w-full sm:w-auto"
              >
                <option :value="5">5 per page</option>
                <option :value="10">10 per page</option>
                <option :value="25">25 per page</option>
                <option :value="50">50 per page</option>
              </select>
              <span class="text-sm text-gray-600">
                Showing {{ startIndex + 1 }} to {{ endIndex }} of
                {{ filteredDonations.length }}
              </span>
            </div>
  
            <div class="flex items-center justify-center gap-2">
              <button
                @click="currentPage--"
                :disabled="currentPage === 1"
                class="px-3 py-1 border rounded-lg disabled:opacity-50 flex items-center gap-1"
              >
                <Icon name="lucide:chevron-left" class="h-4 w-4" />
                <span class="hidden sm:inline">Previous</span>
              </button>
              <span class="text-sm text-gray-600">
                Page {{ currentPage }} of {{ totalPages }}
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
  
        <!-- Empty State -->
        <div v-else class="text-center py-12 bg-gray-50 rounded-lg">
          <Icon
            name="lucide:inbox"
            class="h-12 w-12 text-gray-400 mx-auto mb-4"
          />
          <h3 class="text-lg font-medium text-gray-900">
            Donations not loaded yet!
          </h3>
          <p class="mt-1 text-gray-500">
            {{
              donations.length === 0
                ? "Load donations to see them here. "
                : "Try adjusting your search criteria."
            }}
          </p>
  
          <div class="flex justify-center mt-5">
            <button
              @click="loadDonations"
              class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
            >
              <Icon name="lucide:refresh-cw" class="h-5 w-5" />
              <span>Load Donations</span>
            </button>
          </div>
        </div>
      </template>
  
      <!-- Floating Add Button -->
      <button
        @click="openAddDonationModal"
        class="fixed bottom-8 right-3 w-16 h-16 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-colors flex items-center justify-center"
      >
        <Icon name="lucide:plus" class="h-8 w-8" />
      </button>
  
      <!-- Modals -->
      <UModal v-model="isOpen">
        <AddDonation @donation-added="handleDonationAdded" />
      </UModal>
  
      <UModal v-model="isMoreModalOpen">
        <div class="bg-white rounded-lg shadow-xl">
          <div class="p-6">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-xl font-semibold text-gray-900">Actions</h2>
              <button
                @click="isMoreModalOpen = false"
                class="text-gray-500 hover:text-gray-700"
              >
                <Icon name="lucide:x" class="h-6 w-6" />
              </button>
            </div>
  
            <ul class="divide-y divide-gray-100">
              <li
                v-for="(action, index) in actions"
                :key="index"
                class="group cursor-pointer"
                @click="action.onClick"
              >
                <div
                  class="flex items-center gap-4 py-4 px-2 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div class="flex-shrink-0">
                    <Icon :name="action.icon" class="h-5 w-5 text-gray-500" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <p
                      class="text-sm font-medium text-gray-900 group-hover:text-blue-600"
                    >
                      {{ action.label }}
                    </p>
                    <p class="text-xs text-gray-500 mt-1">
                      {{ action.description }}
                    </p>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </UModal>
  
      <UModal v-model="isUpdateModalOpen">
        <UpdateDonation
          :donation="selectedDonation"
          @donation-updated="handleDonationUpdated"
          @close="isUpdateModalOpen = false"
        />
      </UModal>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, watch } from "vue";
  const { printReceipt } = useUtils();
  const { sendSMS } = useSMS();
  const { deleteDonation, updateDonation } = useRealtimeDB();
  
  // State
  const donations = ref([]);
  const isLoading = ref(false);
  const error = ref(null);
  const isOpen = ref(false);
  const isMoreModalOpen = ref(false);
  const isUpdateModalOpen = ref(false);
  const selectedDonation = ref(null);
  const searchQuery = ref("");
  const currentPage = ref(1);
  const itemsPerPage = ref(10);
  const showDownloadMenu = ref(false);
  
  // Database
  const { fetchDonations } = useRealtimeDB();
  
  // Constants
  const tableHeaders = [
    { key: "name", label: "Name" },
    { key: "contact", label: "Contact" },
    { key: "amount", label: "Amount" },
    { key: "date", label: "Date" },
    { key: "taxType", label: "Tax Type" },
  ];
  
  const actions = [
    {
      icon: "lucide:printer",
      label: "Reprint",
      description: "Print donation receipt again",
      onClick: () => reprintDonation(),
    },
    {
      icon: "lucide:message-square",
      label: "Resend SMS",
      description: "Send confirmation message again",
      onClick: () => resendSMS(),
    },
    // {
    //   icon: "lucide:edit",
    //   label: "Update",
    //   description: "Modify donation details",
    //   onClick: () => updateDonationRecord(),
    // },
    // {
    //   icon: "lucide:trash-2",
    //   label: "Delete",
    //   description: "Remove donation record",
    //   onClick: () => deleteDonationRecord(),
    // },
  ];
  
  // Computed
  const filteredDonations = computed(() => {
    let filtered = donations.value;
  
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase();
      filtered = filtered.filter(
        (donation) =>
          donation.name.toLowerCase().includes(query) ||
          donation.taxType.toLowerCase().includes(query)
      );
    }
  
    // Sort by date in descending order (most recent first)
    return filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
  });
  
  const totalDonations = computed(() => {
    return donations.value.reduce(
      (total, donation) => total + donation.amount,
      0
    );
  });
  
  const donotionsCount = computed(() => {
    if(!donations.value) return 0;
    return donations.value.length;
  });
  
  // Pagination
  const totalPages = computed(() => {
    return Math.ceil(filteredDonations.value.length / itemsPerPage.value);
  });
  
  const startIndex = computed(() => {
    return (currentPage.value - 1) * itemsPerPage.value;
  });
  
  const endIndex = computed(() => {
    return Math.min(
      startIndex.value + itemsPerPage.value,
      filteredDonations.value.length
    );
  });
  
  const paginatedDonations = computed(() => {
    return filteredDonations.value.slice(startIndex.value, endIndex.value);
  });
  
  // Watchers
  watch(searchQuery, () => {
    currentPage.value = 1;
  });
  
  watch(itemsPerPage, () => {
    currentPage.value = 1;
  });
  
  watch(filteredDonations, () => {
    if (currentPage.value > totalPages.value) {
      currentPage.value = Math.max(1, totalPages.value);
    }
  });
  
  // Methods
  const loadDonations = async () => {
    isLoading.value = true;
    error.value = null;
  
    try {
      const donationsData = await fetchDonations("user123");
      donations.value = donationsData;
    } catch (e) {
      error.value = "Failed to load donations. Please try again.";
      console.error("Error loading donations:", e);
    } finally {
      isLoading.value = false;
    }
  };
  
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
  
  const downloadData = () => {
    // Create CSV content
    const headers = tableHeaders.map((h) => h.label).join(",");
    const rows = filteredDonations.value.map((donation) => {
      return [
        donation.name,
        donation.contact,
        donation.amount,
        formatDate(donation.date),
        donation.taxType,
      ].join(",");
    });
  
    const csvContent = [headers, ...rows].join("\n");
  
    // Create and trigger download
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("href", url);
    a.setAttribute(
      "download",
      `donations-${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };
  
  const openAddDonationModal = () => {
    isOpen.value = true;
  };
  
  const handleDonationAdded = async () => {
    await loadDonations();
    isOpen.value = false;
  };
  
  const handleRowClick = (donation) => {
    selectedDonation.value = donation;
    isMoreModalOpen.value = true;
  };
  
  const handleDonationUpdated = async () => {
    await loadDonations();
    isUpdateModalOpen.value = false;
  };
  
  const reprintDonation = async () => {
    if (!selectedDonation.value) return;
  
    const printSuccess = await printReceipt(
      selectedDonation.value,
      "/images/picture.png"
    );
    if (!printSuccess) {
      isMoreModalOpen.value = false;
      const toast = useToast();
      toast.add({
        title: "Warning",
        description: "Failed to print receipt",
        color: "yellow",
      });
    }
  };
  
  const resendSMS = async () => {
    if (!selectedDonation.value) return;
  
    const result = await sendSMS(
      selectedDonation.value.name,
      selectedDonation.value.contact,
      selectedDonation.value.taxType,
      selectedDonation.value.date,
      selectedDonation.value.amount
    );
  
    if (result.success) {
      isMoreModalOpen.value = false;
      const toast = useToast();
      toast.add({
        title: "Success",
        description: "SMS sent successfully",
        color: "green",
      });
    } else {
      console.error(result.message);
      const toast = useToast();
      toast.add({
        title: "Error",
        description: "Failed to send SMS",
        color: "red",
      });
    }
  };
  
  const updateDonationRecord = async () => {
    if (!selectedDonation.value) return;
    isMoreModalOpen.value = false;
    isUpdateModalOpen.value = true;
  };
  
  const deleteDonationRecord = async () => {
    if (!selectedDonation.value) return;
  
    const result = await deleteDonation(
      "user123",
      selectedDonation.value.payment_id
    );
  
    if (result.success) {
      await loadDonations();
      isMoreModalOpen.value = false;
      const toast = useToast();
      toast.add({
        title: "Success",
        description: "Deleted donation record",
        color: "green",
      });
    } else {
      console.error(result.message);
      const toast = useToast();
      toast.add({
        title: "Error",
        description: "Failed to delete donation record",
        color: "red",
      });
    }
  };
  
  // Add click outside directive
  const vClickOutside = {
    mounted: (el, binding) => {
      el._clickOutside = (event) => {
        if (!(el === event.target || el.contains(event.target))) {
          binding.value(event);
        }
      };
      document.addEventListener("click", el._clickOutside);
    },
    unmounted: (el) => {
      document.removeEventListener("click", el._clickOutside);
    },
  };
  
  // Add new methods for download functionality
  const toggleDownloadMenu = () => {
    showDownloadMenu.value = !showDownloadMenu.value;
  };
  
  const closeDownloadMenu = () => {
    showDownloadMenu.value = false;
  };
  
  const downloadCSV = () => {
    // Create CSV content
    const headers = tableHeaders.map((h) => h.label).join(",");
    const rows = filteredDonations.value.map((donation) => {
      return [
        donation.name,
        donation.contact,
        donation.amount,
        formatDate(donation.date),
        donation.taxType,
      ].join(",");
    });
  
    const csvContent = [headers, ...rows].join("\n");
  
    // Create and trigger download
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("href", url);
    a.setAttribute(
      "download",
      `donations-${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    showDownloadMenu.value = false;
  };
  
  const downloadPDF = async () => {
    try {
      const { jsPDF } = await import("jspdf");
      const { autoTable } = await import("jspdf-autotable");
  
      const doc = new jsPDF();
  
      // Add title
      doc.setFontSize(20);
      doc.text("Tax Payment Report", 14, 15);
  
      // Add metadata
      doc.setFontSize(10);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 25);
      doc.text(
        `Total Payments: ${formatCurrency(totalDonations.value)}`,
        14,
        30
      );
      doc.text(`Total Donors: ${donotionsCount.value}`, 14, 35);
  
      // Prepare table data
      const headers = tableHeaders.map((h) => h.label);
      const data = filteredDonations.value.map((donation) => [
        donation.name,
        donation.contact,
        formatCurrency(donation.amount),
        formatDate(donation.date),
        donation.taxType,
      ]);
  
      // Add table
      doc.autoTable({
        head: [headers],
        body: data,
        startY: 45,
        styles: {
          fontSize: 8,
          cellPadding: 3,
        },
        headStyles: {
          fillColor: [59, 130, 246],
          textColor: 255,
          fontSize: 8,
          fontStyle: "bold",
        },
        alternateRowStyles: {
          fillColor: [245, 247, 250],
        },
      });
  
      // Save PDF
      doc.save(`donations-${new Date().toISOString().split("T")[0]}.pdf`);
      showDownloadMenu.value = false;
    } catch (error) {
      console.error("Error generating PDF:", error);
      const toast = useToast();
      toast.add({
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
        color: "red",
      });
    }
  };
  
  // Page Meta
  definePageMeta({
    title: "Donations Dashboard",
    description: "Track donations and donors for your fundraiser.",
    image: "/images/donations.jpg",
    layout: "mainlayout",
  });
  </script>
  