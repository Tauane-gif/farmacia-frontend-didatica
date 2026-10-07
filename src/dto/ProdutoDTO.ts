export default interface ProdutoDTO {
  idProduto: number;
  descricao: string;
  validade?: Date | null;
  preco: number;
  qtdEstoque: number;
  qtdMinEstoque: number;
  emAlerta?: boolean;
}

export interface ProdutoAlertaDTO {
  idProduto: number;
  descricao: string;
  qtdEstoque: number;
  qtdMinEstoque: number;
  emAlerta: boolean;
}

export interface ProdutoAtualizacaoDTO {
  descricao?: string;
  validade?: Date | null;
  preco?: number;
  qtdEstoque?: number;
  qtdMinEstoque?: number;
}
