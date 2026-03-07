// CONFIGURAÇÃO DO FIREBASE - SPEEDBIKE
const firebaseConfig = {
    apiKey: "AIzaSyAheIlCfptWY5Nak49QyUBgBOQCN774omA",
    authDomain: "speedbike-estoque.firebaseapp.com",
    projectId: "speedbike-estoque",
    storageBucket: "speedbike-estoque.firebasestorage.app",
    messagingSenderId: "1034220384887",
    appId: "1:1034220384887:web:5ffe9eafde9bddcbf7cc72",
    measurementId: "G-3D3G7QFTV1"
};

let db;
let inventoryCollection;

// Versão 8.x que funciona sem módulos
function initFirebase() {
    return new Promise((resolve, reject) => {
        const appScript = document.createElement('script');
        appScript.src = 'https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js';
        appScript.onload = () => {
            const firestoreScript = document.createElement('script');
            firestoreScript.src = 'https://www.gstatic.com/firebasejs/8.10.0/firebase-firestore.js';
            firestoreScript.onload = () => {
                firebase.initializeApp(firebaseConfig);
                db = firebase.firestore();
                inventoryCollection = db.collection('inventory');
                console.log("Firebase conectado!");
                resolve(true);
            };
            firestoreScript.onerror = () => reject("Erro Firestore");
            document.head.appendChild(firestoreScript);
        };
        appScript.onerror = () => reject("Erro Firebase");
        document.head.appendChild(appScript);
    });
}

const FirebaseAPI = {
    getAll: async () => {
        if (!db) return null;
        try {
            const snapshot = await inventoryCollection.get();
            const items = [];
            snapshot.forEach(doc => items.push({ id: doc.id, ...doc.data() }));
            return items;
        } catch (error) { console.error(error); return null; }
    },
    add: async (item) => {
        if (!db) return false;
        try {
            const docRef = await inventoryCollection.add(item);
            return docRef.id;
        } catch (error) { console.error(error); return false; }
    },
    update: async (id, item) => {
        if (!db) return false;
        try {
            await inventoryCollection.doc(id).update(item);
            return true;
        } catch (error) { console.error(error); return false; }
    },
    delete: async (id) => {
        if (!db) return false;
        try {
            await inventoryCollection.doc(id).delete();
            return true;
        } catch (error) { console.error(error); return false; }
    },
    updateQuantity: async (id, quantity) => {
        if (!db) return false;
        try {
            await inventoryCollection.doc(id).update({ quantity: quantity });
            return true;
        } catch (error) { console.error(error); return false; }
    }
};

window.FirebaseAPI = FirebaseAPI;
window.initFirebase = initFirebase;
