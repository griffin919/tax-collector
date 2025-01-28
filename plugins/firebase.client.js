import { initializeApp } from 'firebase/app'
import { getDatabase } from 'firebase/database'

export default defineNuxtPlugin((nuxtApp) => {
    const config = useRuntimeConfig()

    const firebaseConfig = {
        apiKey: "AIzaSyCkeyhC1EAsCtdqLdZrAgdSUyIVZwR-8pI",
        authDomain: "nsawabodie.firebaseapp.com",
        projectId: "nsawabodie",
        storageBucket: "nsawabodie.appspot.com",
        messagingSenderId: "244437101251",
        appId: "1:244437101251:web:162f6a6a604ec2a6f31076",
        measurementId: "G-MWDGT7D2D1"
    };

    // const firebaseConfig = {
    //     apiKey: config.public.firebaseApiKey,
    //     authDomain: config.public.firebaseAuthDomain,
    //     databaseURL: config.public.firebaseDatabaseURL,
    //     projectId: config.public.firebaseProjectId,
    //     storageBucket: config.public.firebaseStorageBucket,
    //     messagingSenderId: config.public.firebaseMessagingSenderId,
    //     appId: config.public.firebaseAppId
    //   }

    const firebaseApp = initializeApp(firebaseConfig)

    const database = getDatabase(firebaseApp)

    return {
        provide: {
            database: database
        }
    }

})