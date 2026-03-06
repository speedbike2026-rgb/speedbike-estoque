// ============================================
// SPEEDBIKE - Sistema de Estoque
// ============================================

// Dados do estoque
let inventory = [];
let currentEditId = null;
let currentQuantityId = null;
let useFirebase = false;

// Inicialização
document.addEventListener('DOMContentLoaded', async () => {
    // Tentar inicializar Firebase
    const firebaseReady = await initFirebase();
    
    if (firebaseReady && FirebaseAPI) {
        // Carregar do Firebase
        const firebaseItems = await FirebaseAPI.getAll();
        if (firebaseItems) {
            inventory = firebaseItems;
            useFirebase = true;
            console.log("Usando Firebase para armazenamento");
        }
    }
    
    // Se Firebase não disponível, usar localStorage
    if (!useFirebase) {
        loadInventoryLocal();
        console.log("Usando localStorage para armazenamento");
    }
    
    renderInventory();
    setupEventListeners();
});

// Carregar dados do localStorage
function loadInventoryLocal() {
    const savedData = localStorage.getItem('speedbike_inventory');
    if (savedData) {
        inventory = JSON.parse(savedData);
    } else {
        // Dados de exemplo para iniciar
        inventory = [
            { id: '1', code: 'BIK001', name: 'Pneu 26x2.0', category: 'Pneus', price: 89.90, quantity: 25, minStock: 10, description: 'Pneu MTB borrachudo' },
            { id: '2', code: 'BIK002', name: 'Câmbio Traseiro Shimano', category: 'Cambios', price: 189.90, quantity: 8, minStock: 5, description: 'Câmbio MTB 9 velocidades' },
            { id: '3', code: 'BIK003', name: 'Freio a Disco', category: 'Freios', price: 249.90, quantity: 3, minStock: 5, description: 'Freio hidráulico Shimano' },
            { id: '4', code: 'BIK004', name: 'Guidão Alumínio', category: 'Guidões', price: 129.90, quantity: 12, minStock: 5, description: 'Guidão 31.8mm' },
            { id: '5', code: 'BIK005', name: 'Selim Comfort', category: 'Selins', price: 79.90, quantity: 15, minStock: 8, description: 'Selim acolchoado' },
            { id: '6', code: 'BIK006', name: 'Corrente 9v', category: 'Correntes', price: 49.90, quantity: 30, minStock: 15, description: 'Corrente Shimano' },
            { id: '7', code: 'BIK007', name: 'Pedal CLIP', category: 'Pedais', price: 159.90, quantity: 6, minStock: 5, description: 'Pedal com张三rave' },
            { id: '8', code: 'BIK008', name: 'Roda 29er', category: 'Rodas', price: 399.90, quantity: 2, minStock: 3, description: 'Roda alumínio aro 29' }
        ];
        saveInventory();
    }
}

// Salvar dados
function saveInventory() {
    if (useFirebase) {
        // Firebase já mantém os dados automaticamente
    } else {
        localStorage.setItem('speedbike_inventory', JSON.stringify(inventory));
    }
}

// Configurar event listeners
function setupEventListeners() {
    // Campo de busca
    document.getElementById('searchInput').addEventListener('input', (e) => {
        renderInventory(e.target.value);
    });

    // Fechar modal ao clicar fora
    document.getElementById('itemModal').addEventListener('click', (e) => {
        if (e.target.id === 'itemModal') closeModal();
    });

    document.getElementById('quantityModal').addEventListener('click', (e) => {
        if (e.target.id === 'quantityModal') closeQuantityModal();
    });

    // Fechar modal com ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
            closeQuantityModal();
        }
    });
}

// Renderizar tabela de estoque
function renderInventory(searchTerm = '') {
    const tbody = document.getElementById('inventoryBody');
    const emptyState = document.getElementById('emptyState');
    
    // Filtrar itens
    let filteredItems = inventory;
    if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filteredItems = inventory.filter(item => 
            item.name.toLowerCase().includes(term) ||
            item.code.toLowerCase().includes(term) ||
            item.category.toLowerCase().includes(term)
        );
    }

    // Verificar se há itens
    if (filteredItems.length === 0) {
        tbody.innerHTML = '';
        emptyState.classList.add('active');
    } else {
        emptyState.classList.remove('active');
        
        // Renderizar cada item
        tbody.innerHTML = filteredItems.map(item => {
            const quantityClass = getQuantityClass(item.quantity, item.minStock);
            const priceFormatted = formatPrice(item.price);
            
            return `
                <tr>
                    <td><span class="item-code">${item.code}</span></td>
                    <td><i class="fa-solid fa-box" style="font-size: 1.5rem; color: var(--accent-color);"></i></td>
                    <td><span class="item-name">${item.name}</span></td>
                    <td><span class="item-category">${item.category}</span></td>
                    <td><span class="item-price">${priceFormatted}</span></td>
                    <td>
                        <div class="item-quantity">
                            <span class="qty-badge ${quantityClass}">${item.quantity}</span>
                            <button class="action-btn update" onclick="openQuantityModal('${item.id}')" title="Atualizar quantidade">
                                <i class="fa-solid fa-pen-to-square"></i>
                            </button>
                        </div>
                    </td>
                    <td>
                        <div class="action-buttons">
                            <button class="action-btn edit" onclick="editItem('${item.id}')" title="Editar">
                                <i class="fa-solid fa-pen"></i>
                            </button>
                            <button class="action-btn delete" onclick="deleteItem('${item.id}')" title="Excluir">
                                <i class="fa-solid fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    // Atualizar estatísticas
    updateStats();
}

// Obter classe CSS para quantidade
function getQuantityClass(quantity, minStock) {
    if (quantity === 0) return 'out-of-stock';
    if (quantity <= minStock) return 'low-stock';
    return 'in-stock';
}

// Formatar preço
function formatPrice(price) {
    return 'R$ ' + price.toFixed(2).replace('.', ',');
}

// Atualizar estatísticas
function updateStats() {
    const totalItems = inventory.length;
    const totalStock = inventory.reduce((sum, item) => sum + item.quantity, 0);
    
    document.getElementById('totalItems').textContent = totalItems;
    document.getElementById('totalStock').textContent = totalStock;
}

// ============================================
// MODAL - Novo Item
// ============================================
function openModal() {
    currentEditId = null;
    document.getElementById('modalTitle').textContent = 'Adicionar Novo Item';
    document.getElementById('itemForm').reset();
    document.getElementById('itemModal').classList.add('active');
}

function closeModal() {
    document.getElementById('itemModal').classList.remove('active');
    currentEditId = null;
}

// Salvar item (novo ou editar)
async function saveItem(e) {
    e.preventDefault();
    
    const itemData = {
        code: document.getElementById('itemCode').value.toUpperCase(),
        name: document.getElementById('itemName').value,
        category: document.getElementById('itemCategory').value,
        price: parseFloat(document.getElementById('itemPrice').value),
        quantity: parseInt(document.getElementById('itemQuantity').value),
        minStock: parseInt(document.getElementById('itemMinStock').value),
        description: document.getElementById('itemDescription').value,
        updatedAt: new Date().toISOString()
    };

    // Verificar se código já existe
    const existingCode = inventory.find(item => item.code === itemData.code);
    if (existingCode && existingCode.id !== currentEditId) {
        showNotification('Código já existe!', 'error');
        return;
    }

    if (currentEditId) {
        // Editar item existente
        const index = inventory.findIndex(item => item.id === currentEditId);
        if (index !== -1) {
            if (useFirebase) {
                await FirebaseAPI.update(currentEditId, itemData);
            }
            inventory[index] = { ...inventory[index], ...itemData };
            showNotification('Item atualizado com sucesso!');
        }
    } else {
        // Novo item
        itemData.createdAt = new Date().toISOString();
        
        if (useFirebase) {
            const docId = await FirebaseAPI.add(itemData);
            if (docId) {
                inventory.push({ id: docId, ...itemData });
            }
        } else {
            const newId = Date.now().toString();
            inventory.push({ id: newId, ...itemData });
        }
        showNotification('Item adicionado com sucesso!');
    }

    saveInventory();
    renderInventory(document.getElementById('searchInput').value);
    closeModal();
}

// Editar item
function editItem(id) {
    const item = inventory.find(i => i.id === id);
    if (!item) return;

    currentEditId = id;
    document.getElementById('modalTitle').textContent = 'Editar Item';
    
    document.getElementById('itemCode').value = item.code;
    document.getElementById('itemName').value = item.name;
    document.getElementById('itemCategory').value = item.category;
    document.getElementById('itemPrice').value = item.price;
    document.getElementById('itemQuantity').value = item.quantity;
    document.getElementById('itemMinStock').value = item.minStock;
    document.getElementById('itemDescription').value = item.description || '';
    
    document.getElementById('itemModal').classList.add('active');
}

// Excluir item
async function deleteItem(id) {
    if (confirm('Tem certeza que deseja excluir este item?')) {
        if (useFirebase) {
            await FirebaseAPI.delete(id);
        }
        inventory = inventory.filter(item => item.id !== id);
        saveInventory();
        renderInventory(document.getElementById('searchInput').value);
        showNotification('Item excluído com sucesso!');
    }
}

// ============================================
// MODAL - Atualizar Quantidade
// ============================================
function openQuantityModal(id) {
    const item = inventory.find(i => i.id === id);
    if (!item) return;

    currentQuantityId = id;
    document.getElementById('quantityItemName').textContent = item.name;
    document.getElementById('currentQuantity').textContent = item.quantity;
    document.getElementById('newQuantity').value = item.quantity;
    document.getElementById('quantityModal').classList.add('active');
}

function closeQuantityModal() {
    document.getElementById('quantityModal').classList.remove('active');
    currentQuantityId = null;
}

// Ajustar quantidade com botões +/-
function adjustQuantity(amount) {
    const input = document.getElementById('newQuantity');
    const newValue = Math.max(0, parseInt(input.value) + amount);
    input.value = newValue;
}

// Atualizar quantidade
async function updateQuantity(e) {
    e.preventDefault();
    
    const newQuantity = parseInt(document.getElementById('newQuantity').value);
    const index = inventory.findIndex(item => item.id === currentQuantityId);
    
    if (index !== -1) {
        if (useFirebase) {
            await FirebaseAPI.updateQuantity(currentQuantityId, newQuantity);
        }
        inventory[index].quantity = newQuantity;
        saveInventory();
        renderInventory(document.getElementById('searchInput').value);
        closeQuantityModal();
        showNotification('Quantidade atualizada com sucesso!');
    }
}

// ============================================
// EXPORTAR / IMPORTAR JSON
// ============================================
function exportToJSON() {
    const dataStr = JSON.stringify(inventory, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `speedbike_estoque_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification('Estoque exportado com sucesso!');
}

function importFromJSON(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            const importedData = JSON.parse(e.target.result);
            
            if (!Array.isArray(importedData)) {
                showNotification('Formato de arquivo inválido!', 'error');
                return;
            }

            // Validar dados
            const validItems = importedData.filter(item => 
                item.code && item.name && item.category && 
                typeof item.price === 'number' && typeof item.quantity === 'number'
            );

            if (validItems.length === 0) {
                showNotification('Nenhum item válido encontrado!', 'error');
                return;
            }

            // Confirmar substituição
            if (confirm(`Deseja importar ${validItems.length} itens? Isso substituirá o estoque atual.`)) {
                // Gerar novos IDs se não tiver
                inventory = validItems.map((item, index) => ({
                    ...item,
                    id: item.id || Date.now().toString() + index
                }));

                if (useFirebase) {
                    // Limpar e recriar no Firebase
                    for (const item of inventory) {
                        await FirebaseAPI.add(item);
                    }
                }

                saveInventory();
                renderInventory();
                showNotification(`${validItems.length} itens importados com sucesso!`);
            }
        } catch (error) {
            showNotification('Erro ao ler arquivo!', 'error');
            console.error(error);
        }
    };
    reader.readAsText(file);
    
    // Limpar input
    event.target.value = '';
}

// ============================================
// NOTIFICAÇÕES
// ============================================
function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    const notificationMessage = document.getElementById('notificationMessage');
    
    notificationMessage.textContent = message;
    
    if (type === 'error') {
        notification.style.background = 'linear-gradient(135deg, #e76f51 0%, #c1121f 100%)';
    } else {
        notification.style.background = 'linear-gradient(135deg, #2a9d8f 0%, #21867a 100%)';
    }
    
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

