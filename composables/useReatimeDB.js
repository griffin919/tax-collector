import { ref } from 'vue'
import { ref as dbRef, get, set, update, remove, child } from 'firebase/database'

export const useRealtimeDB = () => {
    const { $database } = useNuxtApp()

    // State
    const isLoading = ref(false)
    const error = ref(null)

    // Fetch donations using Promise pattern
    const fetchDonations = async (userId) => {
        isLoading.value = true
        error.value = null

        try {
            const donationsRef = dbRef($database, `donations/${userId}`)
            const snapshot = await get(donationsRef)

            if (snapshot.exists()) {
                const donationsArray = []
                snapshot.forEach((childSnapshot) => {
                    donationsArray.push({
                        id: childSnapshot.key,
                        ...childSnapshot.val()
                    })
                })
                return donationsArray
            }
            return []
        } catch (err) {
            console.error('Error fetching:', err)
            error.value = err
            throw err
        } finally {
            isLoading.value = false
        }
    }

    const fetchDonationsByFilter = async (userId, filters) => {
        console.log("🚀 ~ fetchDonationsByFilter ~ filters:", filters)
        if (!userId) throw new Error('User ID is required');
    
        let collector_name = filters.collector_name?.value;
        let taxType = filters.taxType?.value;
        console.log("🚀 ~ fetchDonationsByFilter ~ collector_name:", collector_name, taxType)
    
        isLoading.value = true;
        error.value = null;
    
        try {
            const donationsRef = dbRef($database, `donations/${userId}`);
            const snapshot = await get(donationsRef);
    
            if (!snapshot.exists()) {
                return [];
            }
    
            // Convert snapshot to array and add ID to each donation
            let donationsArray = [];
            snapshot.forEach((childSnapshot) => {
                const donation = childSnapshot.val();
                donationsArray.push({
                    id: childSnapshot.key,
                    ...donation,
                    // Ensure taxType and collector_name are objects with value property
                    taxType: typeof donation.taxType === 'object' ? donation.taxType : donation.taxType,
                    collector_name: typeof donation.collector_name === 'object' ? donation.collector_name : donation.collector_name
                });
            });
    
            console.log("🚀 ~ fetchDonationsByFilter ~ donationsArray:", donationsArray)
            // Apply filters if they exist
            return donationsArray.filter(donation => {
                // Date range filter
                if (filters.startDate && filters.endDate) {
                    const donationDate = new Date(donation.date);
                    const startDate = new Date(filters.startDate);
                    const endDate = new Date(filters.endDate);
    
                    // Normalize dates for comparison
                    donationDate.setHours(0, 0, 0, 0);
                    startDate.setHours(0, 0, 0, 0);
                    endDate.setHours(23, 59, 59, 999);
    
                    if (!(donationDate >= startDate && donationDate <= endDate)) {
                        return false;
                    }
                }
    
                // Collector name filter
                if (collector_name) {
                    const filterCollector = collector_name.toLowerCase();
                    const donationCollector = donation.collector_name ? donation.collector_name.toLowerCase() : '';
                    if (filterCollector && donationCollector !== filterCollector) {
                        return false;
                    }
                }
    
                // Tax type filter
                if (taxType) {
                    const filterTaxType = taxType.toLowerCase();
                    const donationTaxType = donation.taxType ? donation.taxType.toLowerCase() : '';
    
                    if (filterTaxType && donationTaxType !== filterTaxType) {
                        return false;
                    }
                }
    
                return true;
            });
    
        } catch (err) {
            console.error('Error fetching filtered:', err);
            error.value = err.message || 'Failed to fetch';
            throw new Error('Failed to fetch: ' + err.message);
        } finally {
            isLoading.value = false;
        }
    };

    // Record new payment
    const recordDonation = async (data, userId) => {
        isLoading.value = true
        error.value = null

        try {
            await set(dbRef($database, `donations/${userId}/${data.payment_id}`), {
                ...data,
                timestamp: Date.now()
            })
            return { success: true }
        } catch (err) {
            console.error('Error recording donation:', err)
            error.value = err
            return { success: false, message: err.message }
        } finally {
            isLoading.value = false
        }
    }

    // Delete donation
    const deleteDonation = async (userId, donationId) => {
        isLoading.value = true
        error.value = null

        try {
            await remove(dbRef($database, `donations/${userId}/${donationId}`))
            return { success: true }
        } catch (err) {
            console.error('Error deleting:', err)
            error.value = err
            return { success: false, message: err.message }
        } finally {
            isLoading.value = false
        }
    }

    // Update donation
    const updateDonation = async (userId, donationId, data) => {
        isLoading.value = true
        error.value = null

        try {
            await update(dbRef($database, `donations/${userId}/${donationId}`), data)
            return { success: true }
        } catch (err) {
            console.error('Error updating:', err)
            error.value = err
            return { success: false, message: err.message }
        } finally {
            isLoading.value = false
        }
    }

    return {
        isLoading,
        error,
        fetchDonations,
        recordDonation,
        deleteDonation,
        updateDonation,
        fetchDonationsByFilter
    }
}