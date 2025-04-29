import {
  validarBotoesPedidoAuto,
  abrirAcordeonPrimeiroPedido,
  clicarEmTodasOrdenacoesPedidoAuto,
  validacaoDoFiltroPedidoAuto,
  validarExclusaoPedidoAutomatico,
  testarExclusaoComFiltro,
  fazerRequestGetFornecedorPaginado,
} from "../functions/pedidoAutomatico/pedidoAutomatico";
import { acessarPedidoManualTodosProdutos } from "../functions/pedidoManual/pedidoManual";
import { loginAuthGetToken } from "../functions/login/login";
import except from "../functions/utils/except";
import { PEDIDO_AUTOMATICO } from "../functions/utils/envVariaveis";
import { inicioDosTestes } from "../functions/login/login";
import {
  logarAcessarCotacaoReiniciarCompletamentePelaApi,
  checarVisibilidadeDosBotoesResumoSituacao1,
  processarPedidoAuto,
} from "../functions/utils/utils";

beforeEach(() => {
  inicioDosTestes(
    PEDIDO_AUTOMATICO,
    "spec-pedidoAutomatico",
    "pedido-automatico"
  );
  checarVisibilidadeDosBotoesResumoSituacao1();
  processarPedidoAuto(PEDIDO_AUTOMATICO);
  cy.reload();
  except();
});

afterEach(() => {
  logarAcessarCotacaoReiniciarCompletamentePelaApi(PEDIDO_AUTOMATICO, true);
});

describe("Realizar o processamento e checagens do pedido automático", () => {
  it("Deve validar a visibilidade dos elementos da aba filtrar produtos da tela do pedido automático", () => {
    validarBotoesPedidoAuto();
  });
  it("Deve abrir o acordeon de analise do pedido e realizar ordenações", () => {
    abrirAcordeonPrimeiroPedido();
    clicarEmTodasOrdenacoesPedidoAuto();
  });
  it("Deve pegar o EAN, Código, Descrição e Fabricante, filtrar no input e validar o resultado do filtro", () => {
    abrirAcordeonPrimeiroPedido();
    validacaoDoFiltroPedidoAuto();
  });
  it("Deve excluir um produto aleatorio utilizando o filtro e o check geral e validar se o mesmo não consta no pedido, ao final reiniciar o pedido", () => {
    abrirAcordeonPrimeiroPedido();
    validarExclusaoPedidoAutomatico();
  });
  it("Deve acessar o pedido manual pelo pedido automatico, com todos os itens e depois reiniciar o pedido", () => {
    acessarPedidoManualTodosProdutos();
  });
  it("Deve acessar o pedido, filtrar um fornecedor, selecionar todos os itens, desmarcar um, excluir e verificar a remoção dos itens marcados", () => {
    testarExclusaoComFiltro();
  });
});

describe("Realiza a checagem da paginação e resposta da API auth com relação ao GET fornecedores", () => {
  it("Deve enviar as requisicoes de 5, 10 e 20 de size e checar as quantidades em todas as paginas", () => {
    loginAuthGetToken().then((token) => {
      fazerRequestGetFornecedorPaginado(0, 5, token); //page, size, token
      fazerRequestGetFornecedorPaginado(1, 5, token);
      fazerRequestGetFornecedorPaginado(2, 5, token);
      fazerRequestGetFornecedorPaginado(3, 5, token);
      fazerRequestGetFornecedorPaginado(4, 5, token);
      fazerRequestGetFornecedorPaginado(5, 5, token);
      fazerRequestGetFornecedorPaginado(6, 5, token, 4);
      fazerRequestGetFornecedorPaginado(0, 10, token);
      fazerRequestGetFornecedorPaginado(1, 10, token);
      fazerRequestGetFornecedorPaginado(2, 10, token);
      fazerRequestGetFornecedorPaginado(3, 10, token, 4);
      fazerRequestGetFornecedorPaginado(0, 20, token);
      fazerRequestGetFornecedorPaginado(1, 20, token, 14);
      fazerRequestGetFornecedorPaginado(0, 50, token, 34);

      except(); // explicação dentro do metodo
    });
  });
});
