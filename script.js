function exportData() {
    let textContent = "========================================\n";
    textContent += "       SPEEDBIKE - RELATÓRIO DE ESTOQUE\n";
    textContent += "========================================\n\n";
    textContent += "Data: " + new Date().toLocaleDateString('pt-BR') + "\n";
    textContent += "Total de Itens: " + inventory.length + "\n";
    textContent += "Estoque Total: " + inventory.reduce((sum, item) => sum + item.quantity, 0) + "\n\n";
    textContent += "----------------------------------------\n";
    textContent += "ITENS DO ESTOQUE\n";
    textContent += "----------------------------------------\n\n";
    
    inventory.forEach((item, index) => {
        textContent += (index + 1) + ". " + item.name + "\n";
        textContent += "   Código: " + item.code + "\n";
        textContent += "   Categoria: " + item.category + "\n";
        textContent += "   Preço: R$ " + item.price.toFixed(2).replace('.', ',') + "\n";
        textContent += "   Quantidade: " + item.quantity + "\n";
        textContent += "   Estoque Mínimo: " + item.minStock + "\n";
        if (item.description) {
            textContent += "   Descrição: " + item.description + "\n";
        }
        textContent += "\n";
    });
    
    textContent += "========================================\n";
    textContent += "Sistema Speedbike - Gerenciamento de Estoque\n";
    
    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'speedbike_estoque_' + new Date().toISOString().split('T')[0] + '.txt';
    a.click();
    URL.revokeObjectURL(url);
    showNotification('Dados exportados!');
}
