// Firebase configuration
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js';
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js';
import { getFirestore, doc, getDoc, setDoc } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js';

// Firebase configuration
const firebaseConfig = {
      apiKey: "AIzaSyBu3ie7Yk6JGtM1Kzag8i3lfuitEipJvsk",
      authDomain: "fvbank-e7920.firebaseapp.com",
      projectId: "fvbank-e7920",
      storageBucket: "fvbank-e7920.firebasestorage.app",
      messagingSenderId: "955965017278",
      appId: "1:955965017278:web:2494c170bff3cbed0622ef"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore();

// Login button
document.getElementById('login-btn').addEventListener('click', async () => {
    const provider = new GoogleAuthProvider();
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        document.getElementById('auth-container').style.display = 'none';
        document.getElementById('user-container').style.display = 'block';
        document.getElementById('user-id').innerText = user.uid;

        // Fetch user balance from Firestore
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
            document.getElementById('balance').innerText = userDoc.data().balance || '00.00$';
        } else {
            await setDoc(userRef, { balance: '00.00$', transfers: [] });
        }
    } catch (error) {
        console.error(error);
    }
});

// Transfer button logic
document.getElementById('transfer-btn').addEventListener('click', () => {
    document.getElementById('transfer-container').style.display = 'block';
});

// Confirm transfer
document.getElementById('confirm-transfer').addEventListener('click', async () => {
    const transferId = document.getElementById('transfer-id').value;
    const amount = parseFloat(document.getElementById('transfer-amount').value);
    const userId = auth.currentUser.uid;
    
    const userRef = doc(db, 'users', userId);
    const receiverRef = doc(db, 'users', transferId);

    const userDoc = await getDoc(userRef);
    const receiverDoc = await getDoc(receiverRef);

    if (userDoc.exists() && receiverDoc.exists() && userDoc.data().balance >= amount) {
        const newBalance = (userDoc.data().balance - amount).toFixed(2);
        const receiverBalance = (receiverDoc.data().balance + amount).toFixed(2);
        
        await setDoc(userRef, { balance: newBalance });
        await setDoc(receiverRef, { balance: receiverBalance });

        document.getElementById('transfer-amount-confirm').innerText = amount + '$';
        document.getElementById('confirmation-container').style.display = 'block';
    } else {
        alert('Недостаточно средств или получатель не найден.');
    }
});

