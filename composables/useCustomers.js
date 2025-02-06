// composables/useCustomersDB.js
import { ref as vueRef } from 'vue'
import { ref as dbRef, get, set, update, remove } from 'firebase/database'

export const useCustomersDB = () => {
    const { $database } = useNuxtApp()
    const isLoading = vueRef(false)
    const error = vueRef(null)

    // Fetch all customers
    const fetchCustomers = async () => {
        isLoading.value = true
        error.value = null

        try {
            const customersRef = dbRef($database, 'customers')
            const snapshot = await get(customersRef)
            
            if (snapshot.exists()) {
                const customersArray = []
                snapshot.forEach((childSnapshot) => {
                    customersArray.push({
                        id: childSnapshot.key,
                        ...childSnapshot.val()
                    })
                })
                return customersArray
            }
            return []
        } catch (err) {
            console.error('Error fetching customers:', err)
            error.value = err
            throw err
        } finally {
            isLoading.value = false
        }
    }

    // Add new customer
    const addCustomer = async (customerData) => {
        isLoading.value = true
        error.value = null

        try {
            const newCustomerRef = dbRef($database, `customers/${customerData.id}`)
            await set(newCustomerRef, {
                ...customerData,
                timestamp: Date.now()
            })
            return { success: true }
        } catch (err) {
            console.error('Error adding customer:', err)
            error.value = err
            return { success: false, message: err.message }
        } finally {
            isLoading.value = false
        }
    }

    // Update existing customer
    const updateCustomer = async (id, customerData) => {
        isLoading.value = true
        error.value = null

        try {
            const customerRef = dbRef($database, `customers/${id}`)
            await update(customerRef, {
                ...customerData,
                updatedAt: Date.now()
            })
            return { success: true }
        } catch (err) {
            console.error('Error updating customer:', err)
            error.value = err
            return { success: false, message: err.message }
        } finally {
            isLoading.value = false
        }
    }

    // Delete customer
    const deleteCustomer = async (id) => {
        isLoading.value = true
        error.value = null

        try {
            await remove(dbRef($database, `customers/${id}`))
            return { success: true }
        } catch (err) {
            console.error('Error deleting customer:', err)
            error.value = err
            return { success: false, message: err.message }
        } finally {
            isLoading.value = false
        }
    }

    // Search customers by name or Ghana card
    const searchCustomers = async (searchTerm) => {
        try {
            const customers = await fetchCustomers()
            const searchLower = searchTerm.toLowerCase()
            
            return customers.filter(customer => 
                customer.firstName.toLowerCase().includes(searchLower) ||
                customer.lastName.toLowerCase().includes(searchLower) ||
                customer.ghanaCard.toLowerCase().includes(searchLower)
            )
        } catch (err) {
            console.error('Error searching customers:', err)
            error.value = err
            return []
        }
    }

    // Validate Ghana Card format (example: GHA-123456789-0)
    const validateGhanaCard = (cardNumber) => {
        const ghanaCardRegex = /^GHA-\d{9}-\d$/
        return ghanaCardRegex.test(cardNumber)
    }

    return {
        isLoading,
        error,
        fetchCustomers,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        searchCustomers,
        validateGhanaCard
    }
}