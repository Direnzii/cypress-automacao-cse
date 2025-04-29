import {
  confirmarPedido,
  logarAcessarCotacaoReiniciarCompletamentePelaApi,
  processarPedidoAuto,
} from "../functions/utils/utils";
import { checarPaginacao } from "../functions/revisaoEnvio/revisaoEnvio";
import { REVISAO_ENVIO } from "../functions/utils/envVariaveis";
import except from "../functions/utils/except";
import { inicioDosTestes } from "../functions/login/login";

beforeEach(() => {
  inicioDosTestes(REVISAO_ENVIO, "spec-revisaoEnvio", "pedido-resumo");
  processarPedidoAuto(REVISAO_ENVIO, false, true);
  confirmarPedido();
  except();
});

afterEach(() => {
  logarAcessarCotacaoReiniciarCompletamentePelaApi(REVISAO_ENVIO, true);
});

describe("Tela de revisão e envio", () => {
  it("Deve acessar todas as abas de resumo dos pedidos antes do envio e checar a paginação depois voltar a cotacao para em analise e reiniciar o pedido", () => {
    checarPaginacao();
  });
});
