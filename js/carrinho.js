// js/carrinho.js - Gestão Completa de Estado do E-commerce (AgroFeira)
class AgroFeiraCarrinho {
    constructor() {
        this.carrinho = JSON.parse(localStorage.getItem('agrofeira_carrinho')) || [];
        this.inicializar();
    }

    inicializar() {
        this.atualizarContador();
        this.renderizarCarrinhoModal();
    }

    adicionarProduto(produto) {
        const index = this.carrinho.findIndex(item => item.id === produto.id);
        if (index > -1) {
            this.carrinho[index].quantidade += 1;
        } else {
            this.carrinho.push({ ...produto, quantidade: 1 });
        }
        this.persitirEAtualizar();
        
        // Feedback visual rápido
        this.mostrarNotificacaoToast(produto.nome);
    }

    removerProduto(produtoId) {
        this.carrinho = this.carrinho.filter(item => item.id !== produtoId);
        this.persitirEAtualizar();
    }

    alterarQuantidade(produtoId, novaQuantidade) {
        const item = this.carrinho.find(item => item.id === produtoId);
        if (item) {
            item.quantidade = parseInt(novaQuantidade);
            if (item.quantidade <= 0) {
                this.removerProduto(produtoId);
            } else {
                this.persitirEAtualizar();
            }
        }
    }

    calcularTotal() {
        return this.carrinho.reduce((total, item) => total + (item.preco * item.quantidade), 0);
    }

    persitirEAtualizar() {
        localStorage.setItem('agrofeira_carrinho', JSON.stringify(this.carrinho));
        this.atualizarContador();
        this.renderizarCarrinhoModal();
    }

    atualizarContador() {
        const contadorEl = document.getElementById('cart-count');
        if (contadorEl) {
            const totalItens = this.carrinho.reduce((sum, item) => sum + item.quantidade, 0);
            contadorEl.textContent = totalItens;
        }
    }

    renderizarCarrinhoModal() {
        const container = document.getElementById('cart-items-container');
        const totalEl = document.getElementById('cart-total');
        if (!container) return;

        if (this.carrinho.length === 0) {
            container.innerHTML = `<p class="text-muted text-center py-4 mb-0">O seu carrinho está vazio.</p>`;
            if (totalEl) totalEl.textContent = 'R$ 0,00';
            return;
        }

        container.innerHTML = this.carrinho.map(item => `
            <div class="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2">
                <div>
                    <h6 class="mb-0 text-success">${item.nome}</h6>
                    <small class="text-muted">R$ ${item.preco.toFixed(2)} un.</small>
                </div>
                <div class="d-flex align-items-center gap-2">
                    <button class="btn btn-sm btn-outline-secondary px-2 py-0" onclick="cart.alterarQuantidade('${item.id}', ${item.quantidade - 1})">-</button>
                    <span class="fw-semibold px-1">${item.quantidade}</span>
                    <button class="btn btn-sm btn-outline-secondary px-2 py-0" onclick="cart.alterarQuantidade('${item.id}', ${item.quantidade + 1})">+</button>
                    <button class="btn btn-sm btn-outline-danger ms-2" onclick="cart.removerProduto('${item.id}')">&times;</button>
                </div>
            </div>
        `).join('');

        if (totalEl) {
            totalEl.textContent = `R$ ${this.calcularTotal().toFixed(2)}`;
        }
    }

    mostrarNotificacaoToast(nomeProduto) {
        // Cria um elemento visual passageiro a avisar que o produto foi adicionado
        const alertaDiv = document.createElement('div');
        alertaDiv.className = 'position-fixed bottom-0 end-0 m-3 p-3 bg-success text-white rounded shadow-lg animate__animated animate__fadeInUp';
        alertaDiv.style.zIndex = '1080';
        alertaDiv.innerHTML = `✅ <strong>${nomeProduto}</strong> adicionado ao carrinho!`;
        document.body.appendChild(alertaDiv);
        
        setTimeout(() => {
            alertaDiv.remove();
        }, 2000);
    }

    finalizarCheckoutWhatsApp() {
        if (this.carrinho.length === 0) {
            alert('Adicione produtos ao carrinho antes de finalizar a encomenda.');
            return;
        }

        let mensagem = "🛒 *Nova Encomenda - AgroFeira*%0A%0A";
        this.carrinho.forEach(item => {
            mensagem += `- ${item.nome} (${item.quantidade}x) - R$ ${(item.preco * item.quantidade).toFixed(2)}%0A`;
        });
        mensagem += `%0A*Total Geral: R$ ${this.calcularTotal().toFixed(2)}*%0A%0Por favor, confirme os detalhes de entrega em Paragominas.`;
        
        const telefoneAdmin = "5591980622997"; // Contacto oficial formatado para o Brasil
        window.open(`https://wa.me/${telefoneAdmin}?text=${mensagem}`, '_blank');
    }
}

// Inicialização automática da instância global
const cart = new AgroFeiraCarrinho();