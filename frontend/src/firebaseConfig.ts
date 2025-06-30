import { initializeApp } from 'firebase/app';

const firebaseConfig = {
    apiKey: "AIzaSyBKtZYyDewIY5JxcsDaIxB2jNtn-8kxnEM",
    authDomain: "fairtrace-c4c30.firebaseapp.com",
    projectId: "fairtrace-c4c30",
    storageBucket: "fairtrace-c4c30.firebasestorage.app",
    messagingSenderId: "804966579154",
    appId: "1:804966579154:web:79a17e9821d061dfcca60b",
    measurementId: "G-S5M0SMHSKY"
  };

export const app = initializeApp(firebaseConfig);
