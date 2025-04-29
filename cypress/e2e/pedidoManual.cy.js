import {
  verificarElementos,
  validarExclusaoInsercaoItem,
} from "../functions/pedidoManual/pedidoManual";
import { marcarTodasCheckboxItem } from "../functions/pedidoManual/checkBoxPedidoManual";
import { PEDIDO_MANUAL } from "../functions/utils/envVariaveis";
import except from "../functions/utils/except";
import { inicioDosTestes } from "../functions/login/login";
import {
  processarPedidoManual,
  logarAcessarCotacaoReiniciarCompletamentePelaApi,
} from "../functions/utils/utils";

beforeEach(() => {
  inicioDosTestes(PEDIDO_MANUAL, "spec-pedidoManual", "pedido-resumo");
  processarPedidoManual(PEDIDO_MANUAL);
  marcarTodasCheckboxItem();
  except();
});

afterEach(() => {
  logarAcessarCotacaoReiniciarCompletamentePelaApi(PEDIDO_MANUAL, true);
});

describe("Testar elementos, exclusão e insersão no pedido manual", () => {
  it("Deve acessar o pedido manual e verificar todos os elementos", () => {
    verificarElementos();
  });
  it("Deve acessar o pedido manual, excluir um item e validar na aba dos excluidos se o mesmo consta, depois inserir no pedido novamente e validar", () => {
    validarExclusaoInsercaoItem();
  });
});
