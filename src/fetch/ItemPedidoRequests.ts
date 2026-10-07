import type ItemPedidoDTO from "../dto/ItemPedidoDTO";
 
// Classe responsável por fazer requisições à API - item do pedido
class ItemPedidoRequests {
    private serverURL;
    private endpointItemPedido;
 
    constructor() {
        this.serverURL = `http://localhost:3333`;
        this.endpointItemPedido = `/api/itens-pedido`;
    }
 
    private headers() {
        const token = localStorage.getItem('token');
        return {
            'Content-Type': 'application/json',
            'x-access-token': `${token}`
        };
    }
 
    // Lista TODOS os itens de todos os pedidos (usado na tela de listagem)
    async obterListaDeItensPedido(): Promise<ItemPedidoDTO[]> {
        try {
            const respostaAPI = await fetch(`${this.serverURL}${this.endpointItemPedido}`, {
                headers: this.headers()
            });
 
            if (respostaAPI.ok) {
                const lista = await respostaAPI.json();
                return lista.map((raw: any) => ({
                    idVenda: Number(raw.idVenda ?? raw.id_venda),
                    idProduto: Number(raw.idProduto ?? raw.id_produto),
                    qtdProduto: Number(raw.qtdProduto ?? raw.qtd_produto),
                    precoUnit: Number(raw.precoUnit ?? raw.preco_unit),
                }));
            } else {
                throw new Error("Não foi possível listar os itens do pedido.");
            }
        } catch (error) {
            console.error(`Erro ao fazer a consulta de itens do pedido. ${error}`);
            return [];
        }
    }
 
    // Lista os itens de UM pedido específico
    async obterItensPorPedido(idVenda: number): Promise<ItemPedidoDTO[]> {
        try {
            const respostaAPI = await fetch(`${this.serverURL}${this.endpointItemPedido}/${idVenda}`, {
                headers: this.headers()
            });
 
            if (respostaAPI.ok) {
                const lista = await respostaAPI.json();
                return lista.map((raw: any) => ({
                    idProduto: raw.idProduto ?? raw.id_produto,
                    descricao: raw.descricao,
                    qtdProduto: raw.qtdProduto ?? raw.qtd_produto,
                    precoUnit: Number(raw.precoUnit ?? raw.preco_unit),
                }));
            } else {
                throw new Error("Não foi possível listar os itens do pedido.");
            }
        } catch (error) {
            console.error(`Erro ao fazer a consulta de itens do pedido. ${error}`);
            return [];
        }
    }
 
    async enviarFormularioItemPedido(formItem: ItemPedidoDTO): Promise<boolean> {
        try {
            const respostaAPI = await fetch(`${this.serverURL}${this.endpointItemPedido}`, {
                method: 'POST',
                headers: this.headers(),
                body: JSON.stringify(formItem)
            });
 
            if (!respostaAPI.ok) throw new Error(`Erro ${respostaAPI.status}: ${respostaAPI.statusText}`);
 
            console.info(`${respostaAPI.status}: ${respostaAPI.statusText}`);
 
            return true;
        } catch (error) {
            console.error(`Erro ao fazer consulta à API. ${error}`);
            return false;
        }
    }
 
    async atualizarItemPedido(
        idVenda: number,
        idProduto: number,
        campos: Partial<Pick<ItemPedidoDTO, 'qtdProduto' | 'precoUnit'>>
    ): Promise<boolean> {
        try {
            const respostaAPI = await fetch(`${this.serverURL}${this.endpointItemPedido}/${idVenda}/${idProduto}`, {
                method: 'PATCH',
                headers: this.headers(),
                body: JSON.stringify(campos)
            });
 
            if (!respostaAPI.ok) throw new Error(`Erro ${respostaAPI.status}: ${respostaAPI.statusText}`);
 
            console.info(`${respostaAPI.status}: ${respostaAPI.statusText}`);
 
            return true;
        } catch (error) {
            console.error(`Erro ao atualizar item do pedido. ${error}`);
            return false;
        }
    }
 
    async removerItemPedido(idVenda: number, idProduto: number): Promise<boolean> {
        try {
            const respostaAPI = await fetch(`${this.serverURL}${this.endpointItemPedido}/${idVenda}/${idProduto}`, {
                method: 'DELETE',
                headers: this.headers()
            });
 
            if (!respostaAPI.ok) throw new Error(`Erro ${respostaAPI.status}: ${respostaAPI.statusText}`);
 
            console.info(`${respostaAPI.status}: ${respostaAPI.statusText}`);
 
            return true;
        } catch (error) {
            console.error(`Erro ao remover item do pedido. ${error}`);
            return false;
        }
    }
}
 
export default new ItemPedidoRequests;