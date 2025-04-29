import {
    abrirModalLupa,
    realizarChecagemNaModal,
} from "../utils/validarModais.js";
import { botoesTelaResumoParaEncerrar } from "../utils/constants";

export function checagemElementosTelaResumoPrincipais() {
    cy.get('[data-testid="botoes-resumo-pedido-novo"]')
        .find("button")
        .each((botao) => {
            if (!botoesTelaResumoParaEncerrar.includes(botao.text())) {
                cy.fail("Botão capturado não esta na lista, ERRO");
            }
        });
}

export function checagemElementosTelaResumoCategoria() {
    cy.get('[data-rbd-droppable-id="droppable"]')
        .find("label")
        .then((listCategorias) => {
            cy.get(listCategorias).each((categoria, index) => {
                checagemDeRespostasCategoria(categoria.get(0).id, index);
            });
        });
}

export function checagemElementosTelaResumoAcordeonCliente() {
    elementosEscritosAcordeonCliente();
}

export function checarDadosModalLupa(tipo, passarPorTodosOsBlocos) {
    let ok = false;
    cy.get('[data-testid="bloco-resposta-representante"]').each(
        (blocoResposta) => {
            // pegar a quantidade de "Visualizar respostar por filial"
            if (!ok) {
                let motivoResposta;
                cy.get(blocoResposta).click(); // abre o acordeon da resposta
                cy.get(blocoResposta)
                    .find('[data-testid="conteudo-tabela-row"]')
                    .each((linhaRespostaCliente) => {
                        // Se tiver algun sinalizador Sucess vai entrar acessar a lupa e fazer as validações
                        try {
                            motivoResposta = linhaRespostaCliente
                                .get(0)
                                .children[4].getAttribute("data-testid")
                                .split("-")[3]; // aqui eu pego exatamente o texto que esta na coluna Resposta do bloco para cada linha
                        } catch {
                            motivoResposta = "Aguardando"; // como o aguardando nao é um motivo valido, ele nao aparece com o atributo necessario, por isso consta aqui
                        }
                        if (motivoResposta === "Respondida") {
                            abrirModalLupa(blocoResposta, linhaRespostaCliente);
                            realizarChecagemNaModal(tipo);
                        }
                    });
            }
            if (!passarPorTodosOsBlocos) {
                ok = true;
            }
        }
    );
}

function elementosEscritosAcordeonCliente() {
    cy.get('[data-testid="acordeon-cliente"]').each(
        (listAcordeonCliente, indx) => {
            // pegar a quantidade de acordeons cliente
            cy.get(listAcordeonCliente)
                .click()
                .wait(250)
                .get('[data-testid="interior-acordeon-cliente"]')
                .eq(indx)
                .find("span")
                .each((dadosAcordeonCliente) => {
                    if (
                        !dadosAcordeonCliente.get(0).textContent.split(":")[1]
                    ) {
                        // checar se tem algum dado vazio no acordeon
                        cy.fail(
                            "Existe algum elemento dentro do acordeon da filial sem nada, elemento index: " +
                                index
                        );
                    }
                });
            cy.get(listAcordeonCliente).click();
        }
    );
}

function checagemDeRespostasCategoria(idElemento, index) {
    let categoriaBuscada = "#" + idElemento;
    function scrollRight(posicaoCategoria) {
        if (posicaoCategoria >= 3) {
            // se o elemento estiver na posição 3 ou a cima, eu scrollo para a direita
            cy.get('[data-rbd-droppable-id="droppable"]')
                .scrollTo("right", { ensureScrollable: true })
                .wait(500);
        }
    }
    cy.get(categoriaBuscada).then(($objCategoria) => {
        const win = $objCategoria[0].ownerDocument.defaultView;
        const pseudoElemento = win.getComputedStyle($objCategoria[0], "before");
        var contentValue = pseudoElemento.getPropertyValue("content"); // pegar o valor do pseudoElemento
        cy.get(categoriaBuscada).click();
        scrollRight(index);
        if (contentValue === `"0"`) {
            // se o numero em cima da categoria for 0 quer dizer que nao tem resposta com esse sinalizador
            cy.get('[data-testid="page-pedido-resumo"]')
                .find("div")
                .contains("Categoria selecionada não encontrada!")
                .should("be.visible");
            cy.get('[data-testid="WarningIcon"]').should("be.visible");
            cy.get(categoriaBuscada).should("be.visible").click();
        } else {
            // quer dizer que existe resposta com esse sinalizador, logo deve ser verificado se corresponde ao mesmo sinalizador filtrado
            cy.wait(800); // os sinalizadores sem filtro por categoria "piscam" em tela nesse ponto, o que as vezes faz com que pegue o sinalizador errado e quebre, dei esse tempo para dar tempo do filtro retornar corretamente
            cy.get("[data-testid^=sinalizadores-bloco-]")
                .first()
                .then((check_sinalizador) => {
                    let categoriaRetornada = check_sinalizador
                        .get(0)
                        .getAttribute("data-testid")
                        .split("-")[2]; // pego o id do sinalizados do bloco da resposta pelo datatestid
                    if (categoriaRetornada != idElemento) {
                        // idElemento pois o categoriaBuscada consta um # de sufixo
                        cy.fail(
                            "Sinalizador exibido ao filtrar é diferente do que foi clicado"
                        );
                    }
                });
            cy.get(categoriaBuscada).should("be.visible").click();
        }
    });
}

export function checarTextosSobrepostosRespondidos() {
    checarDadosModalLupa("textoSobreposto", true);
}

export function checarSelectResumoResposta() {
    cy.get('[data-testid="select-itemsPorPagina"]').as("dropdown");
    cy.get('[data-testid="select-itemsPorPagina"]')
        .find("option")
        .each((options) => {
            cy.get(options)
                .invoke("prop", "value")
                .then((valueOption) => {
                    // pega o valor do option
                    cy.get(options)
                        .invoke("prop", "disabled")
                        .then((estaDesativado) => {
                            // pega o estado disabled do option para ver se ele esta clicavel
                            cy.wait(1500); // precisa esperar esse meio segundo para carregar o DOM da pagina completamente e nao quebrar
                            if (!estaDesativado) {
                                // pego apenas as ativas
                                cy.get("@dropdown").select(valueOption);
                                cy.wait("@getFornecedores").then((response) => {
                                    expect(response.response.statusCode).to.eq(
                                        200
                                    ); // checo de a requisição do size retornou 200
                                    let depoisDeClicarSizeDaURL =
                                        response.response.url
                                            .split("&")[1]
                                            .split("=")[1];
                                    if (
                                        valueOption !== depoisDeClicarSizeDaURL
                                    ) {
                                        cy.fail(
                                            "Valor clicado no option é diferente do valor enviado na request"
                                        );
                                    }
                                });
                            } else {
                                // se estiver desativa, verifica a nao possibilidade de clicar
                                cy.get("@dropdown")
                                    .find(`option[value=${valueOption}]`)
                                    .should("be.disabled");
                            }
                        });
                });
        });
}
