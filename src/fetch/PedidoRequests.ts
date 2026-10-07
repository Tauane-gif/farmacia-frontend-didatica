import type PedidoDTO from "../dto/PedidoDTO";
import type { ItemPedidoCriacaoDTO } from "../dto/PedidoDTO";

// Classe responsável por fazer requisições à API - pedido
class PedidoRequests {
    private serverURL;
    private endpointPedido;

    constructor() {
        this.serverURL = `http://localhost:3333`;
        this.endpointPedido = `/api/pedidos`;
    }

    private headers() {
        const token = localStorage.getItem('token');
        return {
            'Content-Type': 'application/json',
            'x-access-token': `${token}`
        };
    }

    async obterListaDePedidos(): Promise<PedidoDTO[]> {
        try {
            const respostaAPI = await fetch(`${this.serverURL}${this.endpointPedido}`, {
                headers: this.headers()
            });

            if (respostaAPI.ok) {
                const lista = await respostaAPI.json();
                return lista.map((raw: any) => ({
                    idVenda: raw.idVenda ?? raw.id_venda,
                    idCliente: raw.idCliente ?? raw.id_cliente,
                    nomeCliente: raw.nomeCliente ?? raw.nome_cliente,
                    dataVenda: raw.dataVenda ?? raw.data_venda,
                }));
            } else {
                throw new Error("Não foi possível listar os pedidos.");
            }
        } catch (error) {
            console.error(`Erro ao fazer a consulta de pedidos. ${error}`);
            return [];
        }
    }

    async obterPedidoComItens(idVenda: number): Promise<PedidoDTO | undefined> {
        try {
            const respostaAPI = await fetch(`${this.serverURL}${this.endpointPedido}/${idVenda}`, {
                headers: this.headers()
            });

            if (respostaAPI.ok) {
                const raw = await respostaAPI.json();
                const pedido: PedidoDTO = {
                    pedido: {
                        idVenda: raw.pedido.idVenda ?? raw.pedido.id_venda,
                        idCliente: raw.pedido.idCliente ?? raw.pedido.id_cliente,
                        nomeCliente: raw.pedido.nomeCliente ?? raw.pedido.nome_cliente,
                        dataVenda: raw.pedido.dataVenda ?? raw.pedido.data_venda,
                    },
                    itens: raw.itens.map((item: any) => ({
                        idProduto: item.idProduto ?? item.id_produto,
                        descricao: item.descricao,
                        qtdProduto: item.qtdProduto ?? item.qtd_produto,
                        precoUnit: Number(item.precoUnit ?? item.preco_unit),
                    })),
                };
                return pedido;
            } else {
                throw new Error("Não foi possível buscar o pedido.");
            }
        } catch (error) {
            console.error(`Erro ao fazer a consulta de pedido por ID. ${error}`);
            return;
        }
    }

    // Cria o pedido junto com os itens (transação no backend).
    // Retorna o id do pedido criado ou null em caso de erro.
    async enviarFormularioPedido(idCliente: number, itens: ItemPedidoCriacaoDTO[]): Promise<number | null> {
        try {
            const respostaAPI = await fetch(`${this.serverURL}${this.endpointPedido}`, {
                method: 'POST',
                headers: this.headers(),
                body: JSON.stringify({ idCliente, itens })
            });

            if (!respostaAPI.ok) throw new Error(`Erro ${respostaAPI.status}: ${respostaAPI.statusText}`);

            console.info(`${respostaAPI.status}: ${respostaAPI.statusText}`);

            const dados = await respostaAPI.json().catch(() => null);
            return dados?.idVenda ?? dados?.id_venda ?? dados?.id ?? null;
        } catch (error) {
            console.error(`Erro ao fazer consulta à API. ${error}`);
            return null;
        }
    }

    async adicionarItemAoPedido(idVenda: number, item: ItemPedidoCriacaoDTO): Promise<boolean> {
        try {
            const respostaAPI = await fetch(`${this.serverURL}${this.endpointPedido}/${idVenda}/itens`, {
                method: 'POST',
                headers: this.headers(),
                body: JSON.stringify(item)
            });

            if (!respostaAPI.ok) throw new Error(`Erro ${respostaAPI.status}: ${respostaAPI.statusText}`);

            console.info(`${respostaAPI.status}: ${respostaAPI.statusText}`);

            return true;
        } catch (error) {
            console.error(`Erro ao adicionar item ao pedido. ${error}`);
            return false;
        }
    }
}

export default new PedidoRequests;