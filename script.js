// SPEEDBIKE - Sistema de Estoque com Firebase
let inventory = [];
let currentEditId = null;
let currentQuantityId = null;

document.addEventListener('DOMContentLoaded', async () => {
    await initFirebase();
    await loadInventory();
    renderInventory();
    setupEventListeners();
});

async function loadInventory() {
    const items = await FirebaseAPI.getAll();
    if (items && items.length > 0) {
        inventory = items;
    }
}

function setupEventListeners() {
    document.getElementById('searchInput').addEventListener('input', (e) => renderInventory(e.target.value));
    document.getElementById('itemModal').addEventListener('click', (e) => { if (e.target.id === 'itemModal') closeModal(); });
    document.getElementById('quantityModal').addEventListener('click', (e) => { if (e.target.id === 'quantityModal') closeQuantityModal(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { closeModal(); closeQuantityModal(); } });
}

function renderInventory(searchTerm = '') {
    const tbody = document.getElementById('inventoryBody');
    const emptyState = document.getElementById('emptyState');
    let filteredItems = searchTerm ? inventory.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()) || item.code.toLowerCase().includes(searchTerm.toLowerCase()) || item.category.toLowerCase().includes(searchTerm.toLowerCase())) : inventory;

    if (filteredItems.length === 0) {
        tbody.innerHTML = '';
        emptyState.classList.add('active');
    } else {
        emptyState.classList.remove('active');
        tbody.innerHTML = filteredItems.map(item => {
            const qtyClass = item.quantity === 0 ? 'out-of-stock' : item.quantity <= item.minStock ? 'low-stock' : 'in-stock';
            return `<tr>
                <td><span class="item-code">${item.code}</span></td>
                <td><span class="item-name">${item.name}</span></td>
                <td><span class="item-category">${item.category}</span></td>
                <td><span class="item-price">R$ ${item.price.toFixed(2).replace('.', ',')}</span></td>
                <td><span class="qty-badge ${qtyClass}">${item.quantity}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn update" onclick="openQuantity('${item.id}')" title="Editar Quantidade">
                            <i class="fa-solid fa-pen-to-square"></i>
                        </button>
                        <button class="action-btn edit" onclick="editItem('${item.id}')" title="Editar">
                            <i class="fa-solid fa-pen"></i>
                        </button>
                        <button class="action-btn delete" onclick="deleteItem('${item.id}')" title="Excluir">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>`;
        }).join('');
    }
    updateStats();
}

function updateStats() {
    document.getElementById('totalItems').textContent = inventory.length;
    document.getElementById('totalStock').textContent = inventory.reduce((sum, item) => sum + item.quantity, 0);
}

function openModal() {
    currentEditId = null;
    document.getElementById('modalTitle').textContent = 'Adicionar Novo Item';
    document.getElementById('itemForm').reset();
    document.getElementById('itemModal').classList.add('active');
}

function closeModal() { document.getElementById('itemModal').classList.remove('active'); }

async function saveItem(e) {
    e.preventDefault();
    const itemData = { code: document.getElementById('itemCode').value.toUpperCase(), name: document.getElementById('itemName').value, category: document.getElementById('itemCategory').value, price: parseFloat(document.getElementById('itemPrice').value), quantity: parseInt(document.getElementById('itemQuantity').value), minStock: parseInt(document.getElementById('itemMinStock').value), description: document.getElementById('itemDescription').value };
    if (currentEditId) { await FirebaseAPI.update(currentEditId, itemData); const idx = inventory.findIndex(i => i.id === currentEditId); if (idx !== -1) inventory[idx] = { ...inventory[idx], ...itemData }; showNotification('Item atualizado!'); }
    else { itemData.createdAt = new Date().toISOString(); const newId = await FirebaseAPI.add(itemData); inventory.push({ id: newId, ...itemData }); showNotification('Item adicionado!'); }
    renderInventory(document.getElementById('searchInput').value);
    closeModal();
}

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

function openQuantity(id) {
    const item = inventory.find(i => i.id === id);
    if (!item) return;
    currentQuantityId = id;
    document.getElementById('quantityItemName').textContent = item.name;
    document.getElementById('currentQuantity').textContent = item.quantity;
    document.getElementById('newQuantity').value = item.quantity;
    document.getElementById('quantityModal').classList.add('active');
}

async function deleteItem(id) {
    if (confirm('Excluir este item?')) {
        await FirebaseAPI.delete(id);
        inventory = inventory.filter(i => i.id !== id);
        renderInventory(document.getElementById('searchInput').value);
        showNotification('Item excluído!');
    }
}

function closeQuantityModal() { document.getElementById('quantityModal').classList.remove('active'); }
function adjustQuantity(amount) { const input = document.getElementById('newQuantity'); input.value = Math.max(0, parseInt(input.value) + amount); }

async function updateQuantity(e) {
    e.preventDefault();
    const newQty = parseInt(document.getElementById('newQuantity').value);
    await FirebaseAPI.updateQuantity(currentQuantityId, newQty);
    const idx = inventory.findIndex(i => i.id === currentQuantityId);
    if (idx !== -1) inventory[idx].quantity = newQty;
    renderInventory(document.getElementById('searchInput').value);
    closeQuantityModal();
    showNotification('Quantidade atualizada!');
}

function showNotification(message) {
    const n = document.getElementById('notification');
    document.getElementById('notificationMessage').textContent = message;
    n.classList.add('show');
    setTimeout(() => n.classList.remove('show'), 3000);
}

function exportData() {
    const dataStr = JSON.stringify(inventory, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'speedbike_estoque_' + new Date().toISOString().split('T')[0] + '.json';
    a.click();
    URL.revokeObjectURL(url);
    showNotification('Dados exportados!');
}

async function importData(input) {
    const file = input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            const items = JSON.parse(e.target.result);
            if (Array.isArray(items)) {
                for (const item of items) {
                    if (item.id) { await FirebaseAPI.update(item.id, item); }
                    else { await FirebaseAPI.add(item); }
                }
                await loadInventory();
                renderInventory();
                showNotification('Dados importados!');
            }
        } catch (err) { alert('Erro ao importar arquivo!'); }
    };
    reader.readAsText(file);
    input.value = '';
}
