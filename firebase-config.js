// ============================================
// CONFIGURAÇÃO DO FIREBASE - SPEEDBIKE
// ============================================

// Suas credenciais do Firebase (já configuradas!)
const firebaseConfig = {
    apiKey: "AIzaSyAheIlCfptWY5Nak49QyUBgBOQCN774omA",
    authDomain: "speedbike-estoque.firebaseapp.com",
    projectId: "speedbike-estoque",
    storageBucket: "speedbike-estoque.firebasestorage.app",
    messagingSenderId: "1034220384887",
    appId: "1:1034220384887:web:5ffe9eafde9bddcbf7cc72",
    measurementId: "G-3D3G7QFTV1"
};

// ============================================
// CÓDIGO DO APLICATIVO
// ============================================

let db;
let inventoryCollection;

// Inicializar Firebase
function initFirebase() {
    return new Promise((resolve, reject) => {
        // Carregar SDK do Firebase (versão 12)
        const script = document.createElement('script');
        script.src = 'https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js';
        script.onload = () => {
            const firestoreScript = document.createElement('script');
            firestoreScript.src = 'https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js';
            firestoreScript.onload = () => {
                // Inicializar Firebase
                firebase.initializeApp(firebaseConfig);
                db = firebase.firestore();
                inventoryCollection = db.collection('inventory');
                console.log("Firebase conectado com sucesso!");
                resolve(true);
            };
            document.head.appendChild(firestoreScript);
        };
        document.head.appendChild(script);
    });
}

// Funções do Firebase
const FirebaseAPI = {
    // Carregar todos os itens
    getAll: async () => {
        if (!db) return null;
        
        try {
            const snapshot = await inventoryCollection.get();
            const items = [];
            snapshot.forEach(doc => {
                items.push({ id: doc.id, ...doc.data() });
            });
            return items;
        } catch (error) {
            console.error("Erro ao carregar itens:", error);
            return null;
        }
    },

    // Adicionar novo item
    add: async (item) => {
        if (!db) return false;
        
        try {
            const docRef = await inventoryCollection.add(item);
            return docRef.id;
        } catch (error) {
            console.error("Erro ao adicionar item:", error);
            return false;
        }
    },

    // Atualizar item
    update: async (id, item) => {
        if (!db) return false;
        
        try {
            await inventoryCollection.doc(id).update(item);
            return true;
        } catch (error) {
            console.error("Erro ao atualizar item:", error);
            return false;
        }
    },

    // Excluir item
    delete: async (id) => {
        if (!db) return false;
        
        try {
            await inventoryCollection.doc(id).delete();
            return true;
        } catch (error) {
            console.error("Erro ao excluir item:", error);
            return false;
        }
    },

    // Atualizar quantidade
    updateQuantity: async (id, quantity) => {
        if (!db) return false;
        
        try {
            await inventoryCollection.doc(id).update({ quantity: quantity });
            return true;
        } catch (error) {
            console.error("Erro ao atualizar quantidade:", error);
            return false;
        }
    }
};

// Exportar para uso global
window.FirebaseAPI = FirebaseAPI;
window.initFirebase = initFirebase;

