import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import type ItemPedidoDTO from "../../dto/ItemPedidoDTO";
import ItemPedidoRequests from "../../fetch/ItemPedidoRequests";

function ListagemItensPedido() {
    const navigate = useNavigate();

    // =========================================================
    // ESTADOS
    // =========================================================

    const [itens, setItens] = useState<ItemPedidoDTO[]>([]);
    const [busca, setBusca] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [carregando, setCarregando] = useState(true);

    const rowsPerPage = 5;

    // =========================================================
    // FUNÇÕES AUXILIARES
    // =========================================================

    function formatarMoeda(valor: number): string {
        return valor.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
        });
    }

    // =========================================================
    // VALIDAÇÃO DE DADOS NO FRONTEND
    // =========================================================

    function validarItem(item: ItemPedidoDTO): boolean {

        // Validação dos IDs (venda e produto)
        if (
            !Number.isInteger(item.idVenda) ||
            item.idVenda <= 0 ||
            !Number.isInteger(item.idProduto) ||
            item.idProduto <= 0
        ) {
            console.error(
                "Item inválido: os IDs devem ser números inteiros positivos.",
                item
            );

            return false;
        }

        // Validação da quantidade
        if (
            !Number.isInteger(item.qtdProduto) ||
            item.qtdProduto <= 0
        ) {
            console.error(
                "Item inválido: a quantidade deve ser um inteiro positivo.",
                item
            );

            return false;
        }

        // Validação do preço unitário
        if (
            typeof item.precoUnit !== "number" ||
            !Number.isFinite(item.precoUnit) ||
            item.precoUnit < 0
        ) {
            console.error(
                "Item inválido: o preço unitário deve ser um número maior ou igual a zero.",
                item
            );

            return false;
        }

        return true;
    }

    // =========================================================
    // BUSCAR ITENS DO PEDIDO
    // =========================================================

    useEffect(() => {

        async function buscarItens() {

            try {

                setCarregando(true);

                const resposta =
                    await ItemPedidoRequests.obterListaDeItensPedido();

                // Verifica se a resposta é uma lista
                if (!Array.isArray(resposta)) {

                    console.error("A API retornou um formato inválido.");

                    setItens([]);

                    return;
                }

                // Validação dos dados recebidos
                const itensValidos =
                    resposta.filter((item) => validarItem(item));

                setItens(itensValidos);

                if (itensValidos.length !== resposta.length) {

                    console.warn(
                        "Alguns itens foram ignorados porque possuem dados inválidos."
                    );
                }

            } catch (error) {

                console.error("Erro ao buscar itens do pedido:", error);

                setItens([]);

                alert("Não foi possível carregar os itens do pedido.");

            } finally {

                setCarregando(false);

            }
        }

        buscarItens();

    }, []);

    // =========================================================
    // FILTRO / BUSCA (ID da venda ou ID do produto)
    // =========================================================

    const termoBusca = busca.trim();

    const itensFiltrados =
        itens.filter((item) => {

            // Se não existe busca, mostra todos os itens
            if (!termoBusca) {
                return true;
            }

            return (
                String(item.idVenda).includes(termoBusca) ||
                String(item.idProduto).includes(termoBusca)
            );
        });

    // Soma dos subtotais dos itens filtrados
    const totalFiltrado =
        itensFiltrados.reduce(
            (soma, item) => soma + item.qtdProduto * item.precoUnit,
            0
        );

    // =========================================================
    // PAGINAÇÃO
    // =========================================================

    const totalPages =
        Math.max(
            1,
            Math.ceil(itensFiltrados.length / rowsPerPage)
        );

    const indexOfFirstRow = (currentPage - 1) * rowsPerPage;
    const indexOfLastRow = indexOfFirstRow + rowsPerPage;

    const currentItens =
        itensFiltrados.slice(indexOfFirstRow, indexOfLastRow);

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

                                <i className="pi pi-list"></i>

                            </span>

                            <h1 className="text-2xl font-bold tracking-tight text-teal-400 sm:text-3xl">

                                Itens do pedido

                            </h1>

                        </div>

                        <p className="text-sm text-slate-400">

                            Acompanhe os itens registrados em cada venda.

                        </p>

                    </div>

                    {/* BOTÃO NOVO ITEM */}

                    <button
                        type="button"
                        onClick={() => navigate("/cadastro/itempedido")}
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-teal-500 px-5 py-2.5 text-sm font-semibold text-black shadow-sm transition hover:bg-teal-400 hover:shadow-md active:scale-[0.98]"
                    >

                        <span className="text-lg leading-none">
                            +
                        </span>

                        Novo Item

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
                            name="buscar-item-pedido"
                            id="buscar-item-pedido"
                            value={busca}
                            onChange={handleBusca}
                            maxLength={100}
                            placeholder="Buscar por ID da venda ou ID do produto..."
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

                                Lista de itens

                            </h2>

                            <p className="text-xs text-slate-400">

                                {itensFiltrados.length}{" "}

                                {itensFiltrados.length === 1
                                    ? "item encontrado"
                                    : "itens encontrados"}

                                {" "}— total {formatarMoeda(totalFiltrado)}

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

                        <table className="w-full min-w-[700px] text-left text-sm">

                            <thead className="bg-teal-500 text-xs uppercase tracking-wide text-black">

                                <tr>

                                    <th className="px-5 py-4">
                                        Venda
                                    </th>

                                    <th className="px-5 py-4">
                                        Produto
                                    </th>

                                    <th className="px-5 py-4">
                                        Quantidade
                                    </th>

                                    <th className="px-5 py-4">
                                        Preço unitário
                                    </th>

                                    <th className="px-5 py-4">
                                        Subtotal
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
                                            colSpan={6}
                                            className="px-5 py-14 text-center"
                                        >

                                            <div className="flex flex-col items-center gap-3 text-slate-400">

                                                <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-950 border-t-teal-400"></div>

                                                <span className="text-sm">

                                                    Carregando itens do pedido...

                                                </span>

                                            </div>

                                        </td>

                                    </tr>

                                )}

                                {/* LISTA DE ITENS */}

                                {!carregando &&
                                    currentItens.length > 0 &&
                                    currentItens.map((item) => (

                                        <tr
                                            // A chave do item é composta: venda + produto
                                            key={`${item.idVenda}-${item.idProduto}`}
                                            className="group transition-colors hover:bg-teal-950/40"
                                        >

                                            {/* VENDA */}

                                            <td className="px-5 py-4 font-medium text-slate-500">

                                                #{item.idVenda}

                                            </td>

                                            {/* PRODUTO */}

                                            <td className="px-5 py-4 font-medium text-slate-200">

                                                #{item.idProduto}

                                            </td>

                                            {/* QUANTIDADE */}

                                            <td className="px-5 py-4 text-slate-300">

                                                {item.qtdProduto}

                                            </td>

                                            {/* PREÇO UNITÁRIO */}

                                            <td className="px-5 py-4 text-slate-300">

                                                {formatarMoeda(item.precoUnit)}

                                            </td>

                                            {/* SUBTOTAL */}

                                            <td className="px-5 py-4 font-semibold text-teal-400">

                                                {formatarMoeda(
                                                    item.qtdProduto * item.precoUnit
                                                )}

                                            </td>

                                            {/* AÇÕES */}

                                            <td className="px-5 py-4">

                                                <div className="flex items-center justify-center gap-2">

                                                    {/* DETALHES */}

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            navigate(
                                                                `/detalhes/itempedido/${item.idVenda}/${item.idProduto}`
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
                                                                `/atualizar/itempedido/${item.idVenda}/${item.idProduto}`
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

                                {/* NENHUM ITEM */}

                                {!carregando &&
                                    currentItens.length === 0 && (

                                        <tr>

                                            <td
                                                colSpan={6}
                                                className="px-5 py-16 text-center"
                                            >

                                                <div className="flex flex-col items-center">

                                                    <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-teal-950 text-xl text-teal-400">

                                                        <i className="pi pi-list"></i>

                                                    </div>

                                                    <h3 className="font-semibold text-teal-400">

                                                        Nenhum item encontrado

                                                    </h3>

                                                    <p className="mt-1 text-sm text-slate-500">

                                                        {busca
                                                            ? "Tente pesquisar por outro ID de venda ou produto."
                                                            : "Ainda não existem itens de pedido cadastrados."}

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

                                {itensFiltrados.length > 0
                                    ? indexOfFirstRow + 1
                                    : 0}

                            </span>{" "}

                            até{" "}

                            <span className="font-semibold text-teal-400">

                                {Math.min(
                                    indexOfLastRow,
                                    itensFiltrados.length
                                )}

                            </span>{" "}

                            de{" "}

                            <span className="font-semibold text-teal-400">

                                {itensFiltrados.length}

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

export default ListagemItensPedido;