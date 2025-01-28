// composables/useSettingsDB.js
import { ref as vueRef } from 'vue'
import { ref as dbRef, get, set, update, remove } from 'firebase/database'

export const useSettingsDB = () => {
    const { $database } = useNuxtApp()
    const isLoading = vueRef(false)
    const error = vueRef(null)

    // Tax Management
    const fetchTaxTypes = async () => {
        isLoading.value = true
        error.value = null

        try {
            const taxesRef = dbRef($database, 'taxTypes')
            const snapshot = await get(taxesRef)
            
            if (snapshot.exists()) {
                const taxesArray = []
                snapshot.forEach((childSnapshot) => {
                    taxesArray.push({
                        id: childSnapshot.key,
                        ...childSnapshot.val()
                    })
                })
                return taxesArray
            }
            return []
        } catch (err) {
            console.error('Error fetching tax types:', err)
            error.value = err
            throw err
        } finally {
            isLoading.value = false
        }
    }

    const addTaxType = async (taxData) => {
        isLoading.value = true
        error.value = null

        try {
            const newTaxRef = dbRef($database, `taxTypes/${taxData.id}`)
            await set(newTaxRef, {
                ...taxData,
                timestamp: Date.now()
            })
            return { success: true }
        } catch (err) {
            console.error('Error adding tax type:', err)
            error.value = err
            return { success: false, message: err.message }
        } finally {
            isLoading.value = false
        }
    }

    const updateTaxType = async (id, taxData) => {
        isLoading.value = true
        error.value = null

        try {
            const taxRef = dbRef($database, `taxTypes/${id}`)
            await update(taxRef, {
                ...taxData,
                updatedAt: Date.now()
            })
            return { success: true }
        } catch (err) {
            console.error('Error updating tax type:', err)
            error.value = err
            return { success: false, message: err.message }
        } finally {
            isLoading.value = false
        }
    }

    const deleteTaxType = async (id) => {
        isLoading.value = true
        error.value = null

        try {
            await remove(dbRef($database, `taxTypes/${id}`))
            return { success: true }
        } catch (err) {
            console.error('Error deleting tax type:', err)
            error.value = err
            return { success: false, message: err.message }
        } finally {
            isLoading.value = false
        }
    }

    // User Management
    const fetchUsers = async () => {
        isLoading.value = true
        error.value = null

        try {
            const usersRef = dbRef($database, 'users')
            const snapshot = await get(usersRef)
            
            if (snapshot.exists()) {
                const usersArray = []
                snapshot.forEach((childSnapshot) => {
                    usersArray.push({
                        id: childSnapshot.key,
                        ...childSnapshot.val()
                    })
                })
                return usersArray
            }
            return []
        } catch (err) {
            console.error('Error fetching users:', err)
            error.value = err
            throw err
        } finally {
            isLoading.value = false
        }
    }

    const addUser = async (userData) => {
        isLoading.value = true
        error.value = null

        try {
            const newUserRef = dbRef($database, `users/${userData.id}`)
            await set(newUserRef, {
                ...userData,
                timestamp: Date.now()
            })
            return { success: true }
        } catch (err) {
            console.error('Error adding user:', err)
            error.value = err
            return { success: false, message: err.message }
        } finally {
            isLoading.value = false
        }
    }

    const updateUser = async (id, userData) => {
        isLoading.value = true
        error.value = null

        try {
            const userRef = dbRef($database, `users/${id}`)
            await update(userRef, {
                ...userData,
                updatedAt: Date.now()
            })
            return { success: true }
        } catch (err) {
            console.error('Error updating user:', err)
            error.value = err
            return { success: false, message: err.message }
        } finally {
            isLoading.value = false
        }
    }

    const deleteUser = async (id) => {
        isLoading.value = true
        error.value = null

        try {
            await remove(dbRef($database, `users/${id}`))
            return { success: true }
        } catch (err) {
            console.error('Error deleting user:', err)
            error.value = err
            return { success: false, message: err.message }
        } finally {
            isLoading.value = false
        }
    }

    const fetchLoggedInUser = async (pin) => {
        isLoading.value = true
        error.value = null

        try {
            const users = await fetchUsers()
            return users.find(u => u.password === pin)
        } catch (err) {
            console.error('Error fetching logged in user:', err)
            error.value = err
            throw err
        } finally {
            isLoading.value = false
        }
    }

    return {
        isLoading,
        error,
        // Tax methods
        fetchTaxTypes,
        addTaxType,
        updateTaxType,
        deleteTaxType,
        // User methods
        fetchUsers,
        addUser,
        updateUser,
        deleteUser
    }
}