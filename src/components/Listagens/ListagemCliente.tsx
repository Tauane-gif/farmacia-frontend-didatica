import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import type ClienteDTO from "../../dto/ClienteDTO";
import ClienteRequests from "../../fetch/ClienteRequests";

function ListagemClientes() {
    const navigate = useNavigate();

    // =========================================================
    // ESTADOS
    // =========================================================

    const [clientes, setClientes] = useState<ClienteDTO[]>([]);
    const [busca, setBusca] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [carregando, setCarregando] = useState(true);

    const rowsPerPage = 5;

    // =========================================================
    // FUNÇÕES AUXILIARES
    // =========================================================

    // Mantém apenas os dígitos de um texto
    function somenteDigitos(valor: string): string {
        return valor.replace(/\D/g, "");
    }

    // Formata o CPF: 00000000000 -> 000.000.000-00
    function formatarCpf(cpf: string): string {
        const digitos = somenteDigitos(cpf);

        if (digitos.length !== 11) {
            return cpf;
        }

        return digitos.replace(
            /(\d{3})(\d{3})(\d{3})(\d{2})/,
            "$1.$2.$3-$4"
        );
    }

    // =========================================================
    // VALIDAÇÃO DE DADOS NO FRONTEND
    // =========================================================

    function validarCliente(cliente: ClienteDTO): boolean {

        // Validação do ID
        if (
            typeof cliente.idCliente !== "number" ||
            !Number.isInteger(cliente.idCliente) ||
            cliente.idCliente <= 0
        ) {
            console.error(
                "Cliente inválido: o ID deve ser um número inteiro positivo.",
                cliente
            );

            return false;
        }

        // Validação do nome
        if (
            typeof cliente.nome !== "string" ||
            cliente.nome.trim() === ""
        ) {
            console.error(
                "Cliente inválido: o nome não pode estar vazio.",
                cliente
            );

            return false;
        }

        if (cliente.nome.trim().length > 100) {
            console.error(
                "Cliente inválido: o nome não pode possuir mais de 100 caracteres.",
                cliente
            );

            return false;
        }

        // Validação do CPF (11 dígitos)
        if (
            typeof cliente.cpf !== "string" ||
            somenteDigitos(cliente.cpf).length !== 11
        ) {
            console.error(
                "Cliente inválido: o CPF deve possuir 11 dígitos.",
                cliente
            );

            return false;
        }

        return true;
    }

    // =========================================================
    // BUSCAR CLIENTES
    // =========================================================

    useEffect(() => {

        async function buscarClientes() {

            try {

                setCarregando(true);

                const resposta =
                    await ClienteRequests.obterListaDeClientes();

                // Verifica se a resposta é uma lista
                if (!Array.isArray(resposta)) {

                    console.error("A API retornou um formato inválido.");

                    setClientes([]);

                    return;
                }

                // Validação dos dados recebidos
                const clientesValidos =
                    resposta.filter(
                        (cliente) => validarCliente(cliente)
                    );

                setClientes(clientesValidos);

                if (clientesValidos.length !== resposta.length) {

                    console.warn(
                        "Alguns clientes foram ignorados porque possuem dados inválidos."
                    );
                }

            } catch (error) {

                console.error("Erro ao buscar clientes:", error);

                setClientes([]);

                alert("Não foi possível carregar os clientes.");

            } finally {

                setCarregando(false);

            }
        }

        buscarClientes();

    }, []);

    // =========================================================
    // FILTRO / BUSCA (nome, ID ou CPF)
    // =========================================================

    const termoBusca = busca.trim().toLowerCase();
    const termoDigitos = somenteDigitos(busca);

    const clientesFiltrados =
        clientes.filter((cliente) => {

            // Se não existe busca, mostra todos os clientes
            if (!termoBusca) {
                return true;
            }

            const nome = cliente.nome?.toLowerCase() ?? "";
            const id = String(cliente.idCliente);
            const cpf = somenteDigitos(cliente.cpf ?? "");

            return (
                nome.includes(termoBusca) ||
                id.includes(termoBusca) ||
                (termoDigitos !== "" && cpf.includes(termoDigitos))
            );
        });

    // =========================================================
    // PAGINAÇÃO
    // =========================================================

    const totalPages =
        Math.max(
            1,
            Math.ceil(clientesFiltrados.length / rowsPerPage)
        );

    const indexOfFirstRow = (currentPage - 1) * rowsPerPage;
    const indexOfLastRow = indexOfFirstRow + rowsPerPage;

    const currentClientes =
        clientesFiltrados.slice(indexOfFirstRow, indexOfLastRow);

    // Garante que a página atual nunca ultrapasse o total
    useEffect(() => {

        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }

    }, [currentPage, totalPages]);

    function mudarPagina(page: number) {

        if (page < 1) {
            setCurrentPage(1);
            return;
        }

        if (page > totalPages) {
            setCurrentPage(totalPages);
            return;
        }

        setCurrentPage(page);
    }

    // =========================================================
    // CAMPO DE BUSCA
    // =========================================================

    function handleBusca(event: React.ChangeEvent<HTMLInputElement>) {

        const valor = event.target.value;

        // Limita a quantidade de caracteres
        if (valor.length > 100) {
            return;
        }

        setBusca(valor);

        // Volta para a primeira página quando a busca muda
        setCurrentPage(1);
    }

    // =========================================================
    // RENDERIZAÇÃO
    // =========================================================

    return (
        <main className="min-h-screen flex-1 bg-black px-4 py-6 sm:px-6 lg:px-8">

            <div className="mx-auto w-full max-w-[1500px]">

                {/* =====================================================
                    CABEÇALHO
                ====================================================== */}

                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                    <div>

                        <div className="mb-1 flex items-center gap-2">

                            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-950 text-teal-400">

                                <i className="pi pi-users"></i>

                            </span>

                            <h1 className="text-2xl font-bold tracking-tight text-teal-400 sm:text-3xl">

                                Clientes

                            </h1>

                        </div>

                        <p className="text-sm text-slate-400">

                            Acompanhe os clientes cadastrados no sistema.

                        </p>

                    </div>

                    {/* BOTÃO NOVO CLIENTE */}

                    <button
                        type="button"
                        onClick={() => navigate("/cadastro/cliente")}
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-teal-500 px-5 py-2.5 text-sm font-semibold text-black shadow-sm transition hover:bg-teal-400 hover:shadow-md active:scale-[0.98]"
                    >

                        <span className="text-lg leading-none">
                            +
                        </span>

                        Novo Cliente

                    </button>

                </div>

                {/* =====================================================
                    BUSCA
                ====================================================== */}

                <div className="mb-5 rounded-xl border border-teal-900 bg-zinc-950 p-4 shadow-sm">

                    <div className="relative">

                        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-teal-500">

                            <i className="pi pi-search"></i>

                        </span>

                        <input
                            type="text"
                            name="buscar-cliente"
                            id="buscar-cliente"
                            value={busca}
                            onChange={handleBusca}
                            maxLength={100}
                            placeholder="Buscar por nome, CPF ou ID do cliente..."
                            className="w-full rounded-lg border border-zinc-800 bg-black py-3 pl-11 pr-10 text-sm text-slate-200 outline-none transition placeholder:text-slate-500 focus:border-teal-500 focus:ring-2 focus:ring-teal-900"
                        />

                        {busca.length > 0 && (

                            <button
                                type="button"
                                onClick={() => {

                                    setBusca("");

                                    setCurrentPage(1);

                                }}
                                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-sm text-slate-400 transition hover:bg-teal-950 hover:text-teal-400"
                            >

                                <i className="pi pi-times"></i>

                            </button>

                        )}

                    </div>

                </div>

                {/* =====================================================
                    TABELA
                ====================================================== */}

                <div className="overflow-hidden rounded-xl border border-teal-900 bg-zinc-950 shadow-sm">

                    {/* CABEÇALHO DA TABELA */}

                    <div className="flex flex-col gap-2 border-b border-teal-900 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

                        <div>

                            <h2 className="font-semibold text-teal-400">

                                Lista de clientes

                            </h2>

                            <p className="text-xs text-slate-400">

                                {clientesFiltrados.length}{" "}

                                {clientesFiltrados.length === 1
                                    ? "cliente encontrado"
                                    : "clientes encontrados"}

                            </p>

                        </div>

                        {busca && (

                            <span className="rounded-full bg-teal-950 px-3 py-1 text-xs font-medium text-teal-400">

                                Busca: "{busca}"

                            </span>

                        )}

                    </div>

                    {/* ÁREA DA TABELA */}

                    <div className="overflow-x-auto">

                        <table className="w-full min-w-[600px] text-left text-sm">

                            <thead className="bg-teal-500 text-xs uppercase tracking-wide text-black">

                                <tr>

                                    <th className="px-5 py-4">
                                        ID
                                    </th>

                                    <th className="px-5 py-4">
                                        Nome
                                    </th>

                                    <th className="px-5 py-4">
                                        CPF
                                    </th>

                                    <th className="px-5 py-4 text-center">
                                        Ações
                                    </th>

                                </tr>

                            </thead>

                            <tbody className="divide-y divide-zinc-800">

                                {/* CARREGANDO */}

                                {carregando && (

                                    <tr>

                                        <td
                                            colSpan={4}
                                            className="px-5 py-14 text-center"
                                        >

                                            <div className="flex flex-col items-center gap-3 text-slate-400">

                                                <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-950 border-t-teal-400"></div>

                                                <span className="text-sm">

                                                    Carregando clientes...

                                                </span>

                                            </div>

                                        </td>

                                    </tr>

                                )}

                                {/* LISTA DE CLIENTES */}

                                {!carregando &&
                                    currentClientes.length > 0 &&
                                    currentClientes.map((cliente) => (

                                        <tr
                                            key={cliente.idCliente}
                                            className="group transition-colors hover:bg-teal-950/40"
                                        >

                                            {/* ID */}

                                            <td className="px-5 py-4 font-medium text-slate-500">

                                                #{cliente.idCliente}

                                            </td>

                                            {/* NOME */}

                                            <td className="px-5 py-4">

                                                <span className="font-medium text-slate-200">

                                                    {cliente.nome}

                                                </span>

                                            </td>

                                            {/* CPF */}

                                            <td className="px-5 py-4 text-slate-300">

                                                {formatarCpf(cliente.cpf)}

                                            </td>

                                            {/* AÇÕES */}

                                            <td className="px-5 py-4">

                                                <div className="flex items-center justify-center gap-2">

                                                    {/* DETALHES */}

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            navigate(
                                                                `/detalhes/cliente/${cliente.idCliente}`
                                                            )
                                                        }
                                                        className="rounded-lg bg-teal-950 px-3 py-2 text-xs font-semibold text-teal-400 transition hover:bg-teal-500 hover:text-black"
                                                    >

                                                        Detalhes

                                                    </button>

                                                    {/* EDITAR */}

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            navigate(
                                                                `/atualizar/cliente/${cliente.idCliente}`
                                                            )
                                                        }
                                                        className="rounded-lg bg-emerald-950 px-3 py-2 text-xs font-semibold text-emerald-400 transition hover:bg-emerald-500 hover:text-black"
                                                    >

                                                        Editar

                                                    </button>

                                                </div>

                                            </td>

                                        </tr>

                                    ))}

                                {/* NENHUM CLIENTE */}

                                {!carregando &&
                                    currentClientes.length === 0 && (

                                        <tr>

                                            <td
                                                colSpan={4}
                                                className="px-5 py-16 text-center"
                                            >

                                                <div className="flex flex-col items-center">

                                                    <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-teal-950 text-xl text-teal-400">

                                                        <i className="pi pi-users"></i>

                                                    </div>

                                                    <h3 className="font-semibold text-teal-400">

                                                        Nenhum cliente encontrado

                                                    </h3>

                                                    <p className="mt-1 text-sm text-slate-500">

                                                        {busca
                                                            ? "Tente pesquisar por outro nome, CPF ou ID."
                                                            : "Ainda não existem clientes cadastrados."}

                                                    </p>

                                                </div>

                                            </td>

                                        </tr>

                                    )}

                            </tbody>

                        </table>

                    </div>

                    {/* =====================================================
                        PAGINAÇÃO
                    ====================================================== */}

                    <div className="flex flex-col gap-4 border-t border-teal-900 bg-zinc-950 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

                        <p className="text-sm text-slate-400">

                            Mostrando{" "}

                            <span className="font-semibold text-teal-400">

                                {clientesFiltrados.length > 0
                                    ? indexOfFirstRow + 1
                                    : 0}

                            </span>{" "}

                            até{" "}

                            <span className="font-semibold text-teal-400">

                                {Math.min(
                                    indexOfLastRow,
                                    clientesFiltrados.length
                                )}

                            </span>{" "}

                            de{" "}

                            <span className="font-semibold text-teal-400">

                                {clientesFiltrados.length}

                            </span>{" "}

                            resultados

                        </p>

                        <div className="flex items-center gap-1">

                            {/* VOLTAR */}

                            <button
                                type="button"
                                onClick={() => mudarPagina(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="rounded-lg border border-zinc-800 bg-black px-3 py-2 text-sm text-teal-400 transition hover:bg-teal-950 disabled:cursor-not-allowed disabled:opacity-40"
                            >

                                <i className="pi pi-chevron-left"></i>

                            </button>

                            {/* NÚMEROS */}

                            {Array.from(
                                { length: totalPages },
                                (_, index) => index + 1
                            ).map((page) => (

                                <button
                                    type="button"
                                    key={page}
                                    onClick={() => mudarPagina(page)}
                                    className={`min-w-9 rounded-lg px-3 py-2 text-sm font-medium transition ${
                                        currentPage === page
                                            ? "bg-teal-500 text-black shadow-sm"
                                            : "border border-zinc-800 bg-black text-teal-400 hover:bg-teal-950"
                                    }`}
                                >

                                    {page}

                                </button>

                            ))}

                            {/* AVANÇAR */}

                            <button
                                type="button"
                                onClick={() => mudarPagina(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="rounded-lg border border-zinc-800 bg-black px-3 py-2 text-sm text-teal-400 transition hover:bg-teal-950 disabled:cursor-not-allowed disabled:opacity-40"
                            >

                                <i className="pi pi-chevron-right"></i>

                            </button>

                        </div>

                    </div>

                </div>

            </div>

        </main>
    );
}

export default ListagemClientes;