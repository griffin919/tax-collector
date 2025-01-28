<!-- FilteredDonations.vue -->
<template>
  <div class="flex flex-col gap-4">
    <!-- Filters Section -->
    <div class="flex flex-wrap gap-4">
      <!-- Search Input -->
      <div class="relative flex-grow sm:flex-grow-0 sm:w-64">
        <Icon
          name="lucide:search"
          class="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2"
        />
        <input
          v-model="filters.search"
          type="text"
          placeholder="Search payments..."
          class="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <!-- Tax Type Filter -->
      <USelectMenu
        v-model="filters.taxType"
        :options="uniqueTaxTypes"
        placeholder="Filter by Tax Type"
        option-attribute="label"
        searchable
        class="w-full sm:w-48"
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
          <UInput
            v-model="filters.startDate"
            type="date"
            class="w-full"
            @update:modelValue="applyFilters"
          />
        </UFormGroup>

        <UFormGroup>
          <UInput
            v-model="filters.endDate"
            type="date"
            class="w-full"
            @update:modelValue="applyFilters"
          />
        </UFormGroup>
      </div>

      <!-- Apply Filters Button -->
      <UButton color="primary" @click="applyFilters" :loading="loading">
        <Icon name="lucide:filter" class="h-5 w-5" />
      </UButton>

      <!-- Clear Filters Button -->
      <UButton
        v-if="isFiltered"
        color="gray"
        @click="clearFilters"
        :disabled="loading"
      >
        <Icon name="lucide:x" class="h-5 w-5" />
        <span class="ml-2">Clear</span>
      </UButton>
    </div>

    <!-- Results Section -->
    <div v-if="loading" class="flex justify-center py-8">
      <Icon name="lucide:loader" class="h-8 w-8 text-blue-500 animate-spin" />
    </div>
    <div v-else>
      <slot
        :filtered-data="filteredData"
        :loading="loading"
        :total-items="totalItems"
      ></slot>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
const { fetchDonationsByFilter } = useRealtimeDB();

// Props
const props = defineProps({
  data: {
    type: Array,
    required: true,
  },
});

// Emits
const emit = defineEmits(['update:filtered-data']);

// State
const loading = ref(false);
const filters = ref({
  search: '',
  taxType: '',
  collector: '',
  startDate: new Date().toISOString().split('T')[0],
  endDate: new Date().toISOString().split('T')[0],
});

// Computed Properties
const uniqueTaxTypes = computed(() => {
  const types = [...new Set(props.data.map((item) => item.taxType))];
  return [
    { value: '', label: 'All Tax Types' },
    ...types.map((type) => ({ value: type, label: type })),
  ];
});

const uniqueCollectors = computed(() => {
  const collectors = [...new Set(props.data.map((item) => item.collector_name))];
  return [
    { value: '', label: 'All Collectors' },
    ...collectors.map((collector) => ({
      value: collector,
      label: collector,
    })),
  ];
});

const isFiltered = computed(() => {
  return (
    filters.value.search ||
    filters.value.taxType ||
    filters.value.collector ||
    filters.value.startDate !== new Date().toISOString().split('T')[0] ||
    filters.value.endDate !== new Date().toISOString().split('T')[0]
  );
});

const filteredData = ref([]);
const totalItems = computed(() => filteredData.value.length);

// Methods
const applyFilters = async () => {
  loading.value = true;
  try {
    const filterParams = {
      startDate: filters.value.startDate,
      endDate: filters.value.endDate,
      taxType: { value: filters.value.taxType },
      collector_name: { value: filters.value.collector },
    };

    let results = await fetchDonationsByFilter('user123', filterParams);

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

    // Sort by date
    results.sort((a, b) => new Date(b.date) - new Date(a.date));

    filteredData.value = results;
    emit('update:filtered-data', results);
  } catch (error) {
    console.error('Error applying filters:', error);
    const toast = useToast();
    toast.add({
      title: 'Error',
      description: 'Failed to apply filters. Please try again.',
      color: 'red',
    });
  } finally {
    loading.value = false;
  }
};

const clearFilters = () => {
  filters.value = {
    search: '',
    taxType: '',
    collector: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  };
  applyFilters();
};

// Watch for data changes
watch(
  () => props.data,
  () => {
    if (props.data.length > 0) {
      applyFilters();
    }
  },
  { immediate: true }
);
</script>