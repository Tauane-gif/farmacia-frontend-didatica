import type ClienteDTO  from "../dto/ClienteDTO";

// Classe responsável por fazer requisições à API - cliente
class ClienteRequests {
    private serverURL;
    private endpointCliente;

    constructor() {
        this.serverURL = `http://localhost:3333`;
        this.endpointCliente = `/api/clientes`;
    }

    async obterListaDeClientes(): Promise<ClienteDTO[]> {
        try {
            const token = localStorage.getItem('token');
            const respostaAPI = await fetch(`${this.serverURL}${this.endpointCliente}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'x-access-token': `${token}`
                }
            });

            if (respostaAPI.ok) {
                const lista = await respostaAPI.json();
                return lista.map((raw: any) => ({
                    idCliente: raw.idCliente ?? raw.id_cliente,
                    nome: raw.nome,
                    cpf: raw.cpf,
                }));
            } else {
                throw new Error("Não foi possível listar os clientes.");
            }
        } catch (error) {
            console.error(`Erro ao fazer a consulta de clientes. ${error}`);
            return [];
        }
    }

    async enviarFormularioCliente(formCliente: ClienteDTO): Promise<boolean> {
        try {
            const token = localStorage.getItem('token');
            const respostaAPI = await fetch(`${this.serverURL}${this.endpointCliente}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-access-token': `${token}`
                },
                body: JSON.stringify(formCliente)
            });

            if (!respostaAPI.ok) throw new Error(`Erro ${respostaAPI.status}: ${respostaAPI.statusText}`);

            console.info(`${respostaAPI.status}: ${respostaAPI.statusText}`);

            return true;
        } catch (error) {
            console.error(`Erro ao fazer consulta à API. ${error}`);
            return false;
        }
    }
}

export default new ClienteRequests;