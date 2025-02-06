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
        if (!userId) throw new Error('User ID is required');
    
        isLoading.value = true;
        error.value = null;
    
        try {
            // Get donations and customers data in parallel
            const [donationsSnapshot, customersSnapshot] = await Promise.all([
                get(dbRef($database, `donations/${userId}`)),
                get(dbRef($database, 'customers'))
            ]);
    
            if (!donationsSnapshot.exists()) {
                return [];
            }
    
            // Create customers map for efficient lookup
            const customersMap = new Map();
            if (customersSnapshot.exists()) {
                customersSnapshot.forEach((childSnapshot) => {
                    customersMap.set(childSnapshot.key, {
                        id: childSnapshot.key,
                        ...childSnapshot.val()
                    });
                });
            }
    
            // Convert donations snapshot to array and merge with customer data
            let donationsArray = [];
            donationsSnapshot.forEach((childSnapshot) => {
                const donation = {
                    id: childSnapshot.key,
                    ...childSnapshot.val()
                };
    
                // Merge customer data if available
                if (donation.customer_id && customersMap.has(donation.customer_id)) {
                    const customer = customersMap.get(donation.customer_id);
                    donation.customer = {
                        ...customer,
                        // Add any computed fields here if needed
                        age: calculateAge(customer.dateOfBirth)
                    };
                }
    
                donationsArray.push(donation);
            });
    
            // Apply date filtering
            if (filters.startDate && filters.endDate) {
                const startDate = new Date(filters.startDate);
                const endDate = new Date(filters.endDate);
                startDate.setHours(0, 0, 0, 0);
                endDate.setHours(23, 59, 59, 999);
    
                donationsArray = donationsArray.filter(donation => {
                    const donationDate = new Date(donation.date);
                    return donationDate >= startDate && donationDate <= endDate;
                });
            }
    
            return donationsArray;
    
        } catch (err) {
            console.error('Error fetching filtered:', err);
            error.value = err.message || 'Failed to fetch';
            throw new Error('Failed to fetch: ' + err.message);
        } finally {
            isLoading.value = false;
        }
    };
    
    // Helper function for age calculation
    const calculateAge = (dateOfBirth) => {
        if (!dateOfBirth) return null;
        const today = new Date();
        const birthDate = new Date(dateOfBirth);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        
        return age;
    };
    
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