<template>
  <div class="p-6">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold">Update Payment</h3>
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-4">
      <UForm :state="donationData" @submit="handleSubmit">
        <UFormGroup label="Donor Name" class="mb-2">
          <UInput
            v-model="donationData.name"
            placeholder="Enter donor name"
            :rules="rules.name"
            @input="validateField('name')"
            @blur="validateField('name')"
          />
          <p v-if="formErrors.name" class="text-sm text-red-500 mt-1">
            {{ formErrors.name }}
          </p>
        </UFormGroup>

        <UFormGroup label="Donor Contact" class="mb-2">
          <UInput
            v-model="donationData.contact"
            placeholder="0575828312"
            :rules="rules.contact"
            disabled
          />
        </UFormGroup>

        <UFormGroup label="Amount" class="mb-2">
          <UInput
            v-model="donationData.amount"
            type="number"
            step="0.01"
            placeholder="Enter amount"
            icon="i-lucide-dollar-sign"
            :rules="rules.amount"
            @input="validateField('amount')"
            @blur="validateField('amount')"
          />
          <p v-if="formErrors.amount" class="text-sm text-red-500 mt-1">
            {{ formErrors.amount }}
          </p>
        </UFormGroup>

        <UFormGroup label="Date" class="mb-2">
          <UInput
            v-model="donationData.date"
            type="datetime-local"
            :rules="rules.date"
            @input="validateField('date')"
            @blur="validateField('date')"
          />
          <p v-if="formErrors.date" class="text-sm text-red-500 mt-1">
            {{ formErrors.date }}
          </p>
        </UFormGroup>

        <UFormGroup label="Tax Type" class="mb-4">
          <USelectMenu
            v-model="selectedBeneficiary"
            :options="beneficiaries"
            placeholder="Select beneficiary"
            :rules="rules.taxType"

          />
          <p v-if="formErrors.taxType" class="text-sm text-red-500 mt-1">
            {{ formErrors.taxType }}
          </p>
        </UFormGroup>

        <UFormGroup v-if="selectedBeneficiary === 'Other'" class="mb-4">
          <UInput
            v-model="donationData.taxType"
            placeholder="Enter beneficiary name"
            :rules="rules.taxType"
            @input="validateField('taxType')"
            @blur="validateField('taxType')"
          />
          <p v-if="formErrors.taxType" class="text-sm text-red-500 mt-1">
            {{ formErrors.taxType }}
          </p>
        </UFormGroup>

        <div class="flex justify-end gap-2 pt-4 border-t">
          <UButton 
            color="gray" 
            variant="soft" 
            @click="emit('close')"
            :disabled="isLoading"
          >
            Cancel
          </UButton>
          <UButton 
            type="button"
            color="primary" 
            :loading="isLoading"
            @click="handleSave(false)"
            :disabled="!isFormValid"
          >
            Update
          </UButton>
          <UButton 
            type="button"
            color="primary" 
            :loading="isLoading"
            @click="handleSave(true)"
            :disabled="!isFormValid"
          >
            <Icon name="lucide:printer" class="h-4 w-4 mr-2" />
            Update & Print
          </UButton>
        </div>
      </UForm>
    </form>
  </div>
</template>

<script setup>
import { ref, watch, computed, defineEmits, defineProps, onMounted } from "vue";
const { updateDonation } = useRealtimeDB();
const { sendSMS } = useSMS();
const { printReceipt } = useUtils();

const props = defineProps({
  donation: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(["close", "donation-updated"]);
const { isLoading } = useRealtimeDB();

// Form state
const donationData = ref({ ...props.donation });
const shouldPrint = ref(false);
const formErrors = ref({
  name: "",
  contact: "",
  amount: "",
  date: "",
  taxType: "",
});

const beneficiaries = [
  "Wife",
  "Son",
  "Paanii",
  "Eva",
  "Narh",
  "Eric",
  "Family",
  "Aunties",
  "Other",
];

// Initialize selectedBeneficiary with the current donation's beneficiary
const selectedBeneficiary = ref(props.donation.taxType || "Other");

// Validation rules
const rules = {
  name: {
    required: true,
    validator: (value) => {
      if (!value?.trim()) return "Name is required";
      if (value.trim().length < 2) return "Name must be at least 2 characters";
      return true;
    }
  },
  contact: {
    required: true,
    validator: (value) => {
      if (!value) return "Contact is required";
      // Remove any spaces, dashes, or plus signs from the number
      const cleanNumber = value.replace(/[\s\-\+]/g, '');
      
      // Check if it's a valid Ghanaian number format
      const ghanaianPhoneRegex = /^(0|233)?\d{9}$/;
      
      if (!ghanaianPhoneRegex.test(cleanNumber)) {
        return "Please enter a valid Ghanaian phone number";
      }
      return true;
    }
  },
  amount: {
    required: true,
    validator: (value) => {
      if (!value) return "Amount is required";
      if (isNaN(value) || Number(value) <= 0) return "Amount must be greater than 0";
      return true;
    }
  },
  date: {
    required: true,
    validator: (value) => {
      if (!value) return "Date is required";
      return true;
    }
  },
  taxType: {
    required: true,
    validator: (value) => {
      if (!value) return "Beneficiary is required";
      return true;
    }
  }
};

// Form validation state
const isFormValid = computed(() => {
  // Check if any field has an error
  const hasErrors = Object.values(formErrors.value).some(error => error !== "");
  if (hasErrors) return false;

  // Check if all required fields are filled
  const requiredFields = ['name', 'contact', 'amount', 'date', 'taxType'];
  const allFieldsFilled = requiredFields.every(field => {
    const value = donationData.value[field];
    return value !== null && value !== undefined && value !== "";
  });

  // Additional check for 'Other' beneficiary
  if (selectedBeneficiary.value === "Other" && !donationData.value.taxType) {
    return false;
  }

  return allFieldsFilled;
});

// Watch for changes in selectedBeneficiary
watch(selectedBeneficiary, (newValue) => {
  if (newValue !== 'Other') {
    donationData.value.taxType = newValue;
    formErrors.value.taxType = '';
  } else {
    donationData.value.taxType = '';
  }
  validateField('taxType');
});

// Validate individual field
const validateField = (fieldName) => {
  const rule = rules[fieldName];
  if (!rule) return true;

  const value = donationData.value[fieldName];
  const validationResult = rule.validator(value);
  
  if (validationResult === true) {
    formErrors.value[fieldName] = '';
    return true;
  } else {
    formErrors.value[fieldName] = validationResult;
    return false;
  }
};

// Validate all fields
const validateForm = () => {
  let isValid = true;
  Object.keys(rules).forEach(fieldName => {
    if (!validateField(fieldName)) {
      isValid = false;
    }
  });
  return isValid;
};

const handleSave = async (withPrint) => {
  shouldPrint.value = withPrint;
  await handleSubmit();
};

const handleSubmit = async () => {
  if (!validateForm()) {
    const toast = useToast();
    toast.add({
      title: "Error",
      description: "Please fill in all required fields correctly",
      color: "red",
    });
    return;
  }

  try {
    if (selectedBeneficiary.value !== 'Other') {
      donationData.value.taxType = selectedBeneficiary.value;
    }
    
    const result = await updateDonation(
      "user123",
      donationData.value.payment_id,
      donationData.value
    );

    if (result.success) {
      // Print receipt if requested
      if (shouldPrint.value) {
        const printSuccess = await printReceipt(
          donationData.value,
          "/images/picture.png"
        );
        if (!printSuccess) {
          const toast = useToast();
          toast.add({
            title: "Warning",
            description: "Failed to print updated receipt",
            color: "yellow",
          });
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
      );

      if(smsResult.success) {
        const toast = useToast();
        toast.add({
          title: "Success",
          description: "Update notification sent successfully",
          color: "green",
        });
      } else {
        const toast = useToast();
        toast.add({
          title: "Warning",
          description: "Failed to send update notification",
          color: "yellow",
        });
      }

      // Close modal and notify parent
      emit("donation-updated");
      emit("close");

      // Show success message
      const toast = useToast();
      toast.add({
        title: "Success",
        description: shouldPrint.value 
          ? "Payment updated and receipt printed" 
          : "Payment updated successfully",
        color: "green",
      });
    }
  } catch (error) {
    console.error("Failed to update:", error);
    const toast = useToast();
    toast.add({
      title: "Error",
      description: "Failed to update",
      color: "red",
    });
  }

  shouldPrint.value = false;
};

onMounted(() => {
  console.log("Updating:", donationData.value.payment_id);
});
</script>