<!-- pages/index.vue -->
<template>
    <div class="min-h-screen bg-gray-100 flex flex-col">
      <main class="flex-grow container mx-auto px-6 py-12">
        <div class="text-center">
          <h2 class="text-4xl font-bold text-gray-800 mb-4">Easily Collect Funeral Donations</h2>
          <p class="text-xl text-gray-600 mb-8">Create a fundraiser to cover funeral expenses and honor your loved ones.</p>
          <button 
            @click="handleSignup"
            class="bg-green-500 text-white px-6 py-3 rounded-md text-lg font-semibold hover:bg-green-600 transition"
          >
            Start Your Fundraiser
          </button>
        </div>
  
        <div class="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div v-for="(feature, index) in features" :key="index" class="bg-white p-6 rounded-lg shadow-md">
            <h3 class="text-xl font-semibold mb-4">{{ feature.title }}</h3>
            <p>{{ feature.description }}</p>
          </div>
        </div>
      </main>
  
      <footer class="bg-gray-800 text-white py-6">
        <div class="container mx-auto px-6 text-center">
          <p>&copy; {{ new Date().getFullYear() }} Rigel Inc. All rights reserved.</p>
        </div>
      </footer>
  
    </div>
  </template>
  
  <script setup>
  import { ref, reactive } from 'vue'
  import { useRouter } from 'vue-router'
  const router = useRouter()



definePageMeta({
    title: 'Easily Collect Funeral Donations',
    description: 'Create a fundraiser to cover funeral expenses and honor your loved ones.',
    image: '/images/funeral.jpg',
    layout: 'indexlayout'
  })
  
  const features = [
    { title: 'Easy Setup', description: 'Create your fundraiser in minutes with our user-friendly platform.' },
    { title: 'Share Easily', description: 'Spread the word with built-in social media sharing tools.' },
    { title: 'Secure Payments', description: 'Receive donations safely with our trusted payment system.' }
  ]
  
  const handleSignup = () => {
    // Implement signup logic here
    console.log('Signup:')
    router.push('/signup')
  }
  
  

  </script>

  
  