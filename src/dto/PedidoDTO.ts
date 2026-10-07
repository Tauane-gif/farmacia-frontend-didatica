export default interface PedidoDTO {
  pedido: {
    idVenda?: number;
    idCliente?: number;
    nomeCliente?: string;
    dataVenda?: string | Date;
  };
  itens: Array<{
    idProduto: number;
    descricao?: string;
    qtdProduto: number;
    precoUnit: number;
  }>;
}

export interface ItemPedidoCriacaoDTO {
  idProduto: number;
  qtdProduto: number;
  precoUnit?: number;
  descricao?: string;
}