import type ProdutoDTO from "../dto/ProdutoDTO";

// Classe responsável por fazer requisições à API - produto
class ProdutoRequests {
    private serverURL;
    private endpointProduto;

    constructor() {
        this.serverURL = `http://localhost:3333`;
        this.endpointProduto = `/api/produtos`;
    }

    private headers() {
        const token = localStorage.getItem('token');
        return {
            'Content-Type': 'application/json',
            'x-access-token': `${token}`
        };
    }

    async obterListaDeProdutos(): Promise<ProdutoDTO[]> {
        try {
            const respostaAPI = await fetch(`${this.serverURL}${this.endpointProduto}`, {
                headers: this.headers()
            });

            if (respostaAPI.ok) {
                const lista = await respostaAPI.json();
                return lista.map((raw: any) => ({
                    idProduto: raw.idProduto ?? raw.id_produto,
                    descricao: raw.descricao,
                    validade: raw.validade ?? null,
                    preco: Number(raw.preco),
                    qtdEstoque: raw.qtdEstoque ?? raw.qtd_estoque,
                    qtdMinEstoque: raw.qtdMinEstoque ?? raw.qtd_min_estoque,
                    emAlerta: raw.emAlerta ?? raw.em_alerta,
                }));
            } else {
                throw new Error("Não foi possível listar os produtos.");
            }
        } catch (error) {
            console.error(`Erro ao fazer a consulta de produtos. ${error}`);
            return [];
        }
    }

    async obterProdutosEmAlerta(): Promise<ProdutoDTO[]> {
        try {
            const respostaAPI = await fetch(`${this.serverURL}${this.endpointProduto}/alerta`, {
                headers: this.headers()
            });

            if (respostaAPI.ok) {
                const lista = await respostaAPI.json();
                return lista.map((raw: any) => ({
                    idProduto: raw.idProduto ?? raw.id_produto,
                    descricao: raw.descricao,
                    qtdEstoque: raw.qtdEstoque ?? raw.qtd_estoque,
                    qtdMinEstoque: raw.qtdMinEstoque ?? raw.qtd_min_estoque,
                    emAlerta: raw.emAlerta ?? raw.em_alerta,
                }));
            } else {
                throw new Error("Não foi possível listar os produtos em alerta.");
            }
        } catch (error) {
            console.error(`Erro ao fazer a consulta de produtos em alerta. ${error}`);
            return [];
        }
    }

    async enviarFormularioProduto(formProduto: ProdutoDTO): Promise<boolean> {
        try {
            const respostaAPI = await fetch(`${this.serverURL}${this.endpointProduto}`, {
                method: 'POST',
                headers: this.headers(),
                body: JSON.stringify(formProduto)
            });

            if (!respostaAPI.ok) throw new Error(`Erro ${respostaAPI.status}: ${respostaAPI.statusText}`);

            console.info(`${respostaAPI.status}: ${respostaAPI.statusText}`);

            return true;
        } catch (error) {
            console.error(`Erro ao fazer consulta à API. ${error}`);
            return false;
        }
    }

    async atualizarProduto(idProduto: number, campos: ProdutoDTO): Promise<boolean> {
        try {
            const respostaAPI = await fetch(`${this.serverURL}${this.endpointProduto}/${idProduto}`, {
                method: 'PATCH',
                headers: this.headers(),
                body: JSON.stringify(campos)
            });

            if (!respostaAPI.ok) throw new Error(`Erro ${respostaAPI.status}: ${respostaAPI.statusText}`);

            console.info(`${respostaAPI.status}: ${respostaAPI.statusText}`);

            return true;
        } catch (error) {
            console.error(`Erro ao atualizar produto. ${error}`);
            return false;
        }
    }

    // Ajuste manual de estoque (delta positivo ou negativo).
    // Não usar para vendas: a baixa é feita pelo trigger ao inserir o item.
    async atualizarEstoqueDelta(idProduto: number, delta: number): Promise<boolean> {
        try {
            const respostaAPI = await fetch(`${this.serverURL}${this.endpointProduto}/${idProduto}/estoque`, {
                method: 'PATCH',
                headers: this.headers(),
                body: JSON.stringify({ delta })
            });

            if (!respostaAPI.ok) throw new Error(`Erro ${respostaAPI.status}: ${respostaAPI.statusText}`);

            console.info(`${respostaAPI.status}: ${respostaAPI.statusText}`);

            return true;
        } catch (error) {
            console.error(`Erro ao ajustar estoque. ${error}`);
            return false;
        }
    }
}

export default new ProdutoRequests;