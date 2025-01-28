export default defineNuxtRouteMiddleware(async (to) => {
  // Skip middleware on server-side and during client-side hydration
  if (process.server || import.meta.env.SSR) {
    return
  }

  // Add a small delay to ensure DOM is fully hydrated
  return new Promise(async resolve => {
    setTimeout(async () => {
      const pin = localStorage.getItem('user_pin')

      // Allow access to login page
      if (to.path === '/') {
        // If user is already logged in, redirect based on their role
        if (pin) {
          try {
            const { $database } = useNuxtApp()
            const { fetchUsers } = useSettingsDB()
            const users = await fetchUsers()
            const user = users.find(u => u.password === pin)

            if (user) {
              if (user.role === 'Admin') {
                resolve(navigateTo('/donate', { replace: true }))
              } else {
                resolve(navigateTo('/donations', { replace: true }))
              }
              return
            } else {
              // Invalid pin, remove it and stay on login
              localStorage.removeItem('user_pin')
            }
          } catch (error) {
            console.error('Error in auth middleware:', error)
          }
        }
        resolve()
        return
      }

      // If not authenticated at all, redirect to login
      if (!pin) {
        resolve(navigateTo('/', { replace: true }))
        return
      }

      try {
        const { fetchUsers } = useSettingsDB()
        const users = await fetchUsers()
        const user = users.find(u => u.password === pin)

        if (!user) {
          // Invalid pin, redirect to login
          localStorage.removeItem('user_pin')
          resolve(navigateTo('/', { replace: true }))
          return
        }

        // Handle route access based on role
        if (user.role === 'Admin') {
          // Admin can access all routes
          resolve()
        } else {
          // Collector can only access /donations
          if (to.path !== '/donations') {
            resolve(navigateTo('/donations', { replace: true }))
            return
          }
          resolve()
        }
      } catch (error) {
        console.error('Error in auth middleware:', error)
        // On error, redirect to login
        localStorage.removeItem('user_pin')
        resolve(navigateTo('/', { replace: true }))
      }
    }, 10)
  })
})