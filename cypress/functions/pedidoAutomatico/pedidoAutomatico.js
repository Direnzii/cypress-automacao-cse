import {
    processarPedidoAuto,
    checarVisibilidadeDoBotaoDepoisClicar,
    random,
} from "../utils/utils";
import {
    listaSituacoes,
    botoesPedidoClick,
    botaoConfirmarPedido,
    botaoExcluirProduto,
    botaoProdutosExcluidos,
    botaoEncerrarCotacao,
} from "../utils/constants";
import {
    PEDIDOAUTOMATICO,
    TESTESGERAIS,
    URL_AUTH_DEMO,
} from "../utils/envVariaveis";
import {
    reiniciarPedidoAlterandoVencimento,
    clicarNoBotaoTelaResumo,
} from "../utils/validarModais.js";

export function validarBotoesPedidoAuto() {
    cy.get('input[name="busca"]')
        .should("be.visible")
        .type("Testando o input")
        .clear(); //input do filtro de produtos
    cy.get('select[name="idFornecedor"]')
        .should("be.visible")
        .find("option")
        .each((optionsForn) => {
            cy.get('select[name="idFornecedor"]')
                .should("be.visible")
                .select(optionsForn.text());
        }); //select de fornecedores
    cy.get('select[name="acimaDoValor"]')
        .should("be.visible")
        .select("acima")
        .select("abaixo")
        .select("acima"); //acima abaixo para referencia, historico e cot X ped
    cy.get('select[name="tipoComparacao"]')
        .should("be.visible")
        .select("Valor de histórico")
        .select("Qtd ped. em relação a cot.")
        .select("Valor de referência"); //select referencia, historico e cot X ped
    cy.get('select[name="tipoComparacao"]')
        .next()
        .should("be.visible")
        .type("99.99")
        .type("999.99")
        .type("0.99")
        .type("0.09")
        .clear(); //Valor 0.00 da porcentagem
    cy.get('select[name="filtroPorcentagem"]')
        .should("be.visible")
        .select("%")
        .select("R$"); //select % ou R$
    cy.get("#conflitoDeEmbalagem").should("be.visible").click().click(); //checkbox confito emb
    cy.get("#problemaDeMinimo").should("be.visible").click().click(); //checkbox minimo uni
    cy.get("#oportunidade").should("be.visible").click().click(); //oportunidade de desc
    cy.get("#combo").should("be.visible").click().click(); //filtro do combo
    cy.get("#problemaFaturamentoMinimo").should("be.visible").click().click(); //problema de minimo pedido
    botoesPedidoClick.forEach((botao) => {
        cy.get('[class="content"]')
            .find("button")
            .contains(botao)
            .should("be.visible");
    });
    cy.get('[class="content"]')
        .find("label")
        .contains("Total dos Pedidos:")
        .should("be.visible"); //total de pedidos
    cy.get("#check-all-products").should("be.visible"); //checkbox Selecionar todos os produtos
}

export function abrirAcordeonPrimeiroPedido() {
    /*Essa função é resposavel apenas por clicar no primeiro acordeon de pedido da tela do pedido automatico*/
    cy.wait(1000);
    cy.get('[class="MuiAccordion-region"]')
        .eq(2)
        .find('[data-testid="DoubleArrowIcon"]')
        .first()
        .should("be.visible")
        .click(); // clico no primeiro acordeon eq(2)
    cy.get('[data-testid="conteudo-tabela-row"]').should("be.visible");
    cy.get('[data-testid="conteudo-tabela-cell"]').should("be.visible");
}

export function clicarEmTodasOrdenacoesPedidoAuto() {
    /*Essa função clica em TODAS as ordenações e checa se a request do filtro retornou 200, existia um bug que retornava 400 na request,
    esse metodo não checa a ordenação em si, ou seja, não verifica a ordem, se é alfabetica ou qualquer que seja, apenas clica e ve os responses*/
    cy.intercept("GET", `${URL_AUTH_DEMO}/pedidoAutomatico/*/itens?busca=*`).as(
        "filtro"
    );
    cy.get('[class*="MuiTable-root"]')
        .find("thead")
        .first()
        .find("td")
        .each((celulaCabecalhoTabelaPedidoAuto) => {
            if (
                celulaCabecalhoTabelaPedidoAuto.text() &&
                celulaCabecalhoTabelaPedidoAuto.get(0).style.cssText !==
                    "display: none;" // existem celulas invisiveis dentro dessa tag, aqui eu filtro elas
            ) {
                cy.get(celulaCabecalhoTabelaPedidoAuto).click().click().click(); // clico 3x para voltar a ordenação ao estado original
                cy.wait("@filtro").its("response.statusCode").should("eq", 200);
            }
        });
}

function filtrarPedidoAuto(textoParaPesquisar) {
    cy.get('[class="MuiAccordion-region"]')
        .first()
        .find("input")
        .first()
        .clear();
    cy.get('[class="MuiAccordion-region"]')
        .first()
        .find("input")
        .first()
        .type(textoParaPesquisar); // escrever o texto no input do filtro
    cy.get('[class="content"]')
        .find("button")
        .contains("Filtrar")
        .should("be.visible")
        .click(); // clicar em filtrar
}

function checarFiltroDeProdutoPedidoAuto(textoParaPesquisar, excluido = false) {
    /*Essa função é responsavel por pesquisar um determinado texto na busca do pedido automatico e checar se o mesmo se encontra no resultado
    ou checar se depois de filtrar aparece a mensagem de "nenhum dado foi encontrado!" */
    cy.wait(1000);
    filtrarPedidoAuto(textoParaPesquisar);
    if (excluido === true) {
        cy.get("span")
            .contains("Nenhum dado foi encontrado!")
            .should("be.visible");
    } else {
        abrirAcordeonPrimeiroPedido();
        cy.get('[data-testid="conteudo-tabela-row"]')
            .first()
            .contains(textoParaPesquisar)
            .should("be.visible"); // verificar se o retorno do filtro esta correto
    }
    cy.get('[class="content"]')
        .find("button")
        .contains("Limpar")
        .should("be.visible")
        .click();
    abrirAcordeonPrimeiroPedido();
}

function validarSeFiltroFunciona(objeto) {
    cy.get(objeto).each((linhaObjt) => {
        checarFiltroDeProdutoPedidoAuto(linhaObjt.text());
    });
}

export function validacaoDoFiltroPedidoAuto() {
    checagemDeAlertasPadraoPedidoAuto();
    cy.get('[data-testid="conteudo-tabela-row"]').then((listObjtProduto) => {
        let indexRandom = random(listObjtProduto.length);
        cy.get('[data-testid="conteudo-tabela-row"]')
            .eq(indexRandom)
            .find('[data-testid="conteudo-tabela-cell"]')
            .each((_, idx_linha) => {
                if (idx_linha === 3 || idx_linha === 4) {
                    cy.get('[data-testid="conteudo-tabela-row"]')
                        .eq(indexRandom)
                        .find('[data-testid="conteudo-tabela-cell"]')
                        .eq(idx_linha)
                        .find("span")
                        .each((spanLinha) => {
                            // checarFiltroDeProdutoPedidoAuto(spanLinha.text());
                            validarSeFiltroFunciona(spanLinha);
                        });
                }
            });
    });
}

function checagemDeAlertasPadraoPedidoAuto() {
    checarVisibilidadeDoBotaoDepoisClicar(botaoExcluirProduto);
    cy.get("#alert")
        .contains("ATENÇÃO! Nenhum produto foi selecionado.")
        .should("be.visible");
    cy.get("#alert").find("svg").click();
    checarVisibilidadeDoBotaoDepoisClicar(botaoProdutosExcluidos);
    cy.get("#alert")
        .contains(
            'Não há produtos excluídos. Para excluir um produto, selecione o produto e clique em "Excluir".'
        )
        .should("be.visible");
    cy.get("#alert").find("svg").click();
}

export function validarExclusaoPedidoAutomatico() {
    /*Essa função é responsavel por checar os alertas do pedido manual, para exclusão e ver resposta por produto
    bem como a exclusão de fato de um item aleatorio do pedido e depois a sua verificação, para constatar que foi realmente excluido*/
    checagemDeAlertasPadraoPedidoAuto();
    cy.get('[data-testid="conteudo-tabela-row"]').then((listObjtProduto) => {
        let indexRandom = random(listObjtProduto.length);
        cy.get('[data-testid="conteudo-tabela-row"]')
            .eq(indexRandom)
            .then((objExcluido) => {
                let ean = objExcluido.get(0).querySelector(
                    `.spanField` // coluna do ean e codigo
                ).textContent;
                let descricao = objExcluido.get(0).querySelector(
                    `.truncate` // coluna descricao e fabricante
                ).textContent;
                let listEanDescricao = [ean, descricao];
                filtrarPedidoAuto(ean);
                cy.wait(1000); // espero um pouco pois o scroll infinito da um pequeno load no pedido
                marcarCheckTodos();
                checarVisibilidadeDoBotaoDepoisClicar(botaoExcluirProduto);
                cy.wait(1000);
                listEanDescricao.forEach((item) => {
                    checarFiltroDeProdutoPedidoAuto(item, true);
                });
            });
    });
    /*chamo esse bloco abaixo para voltar a cotação no estado de pedido auto gerado para nao ter interferencia nos proximos testes*/
}

export function fazerPesquisaParcialeExcluir() {
    // Função criada para pegar a descrição de algum produto aleatório e realizar o filtro parcial desse produto e exlcui-lo

    checagemDeAlertasPadraoPedidoAuto();
    cy.get('[data-testid="conteudo-tabela-row"]').then((listObjtProduto) => {
        let indexRandom = random(listObjtProduto.length);

        cy.get('[data-testid="conteudo-tabela-row"]')
            .eq(indexRandom)
            .then((objExcluido) => {
                let descricao = objExcluido
                    .get(0)
                    .querySelector(`.truncate`).textContent;
                const corte =
                    descricao.length > 13 ? 8 : descricao.length > 8 ? 4 : 2;
                let itemParcial = descricao.slice(0, descricao.length - corte);
                filtrarPedidoAuto(itemParcial);
                cy.wait(1000); // esperar para o scroll infinito carregar
                marcarCheckTodos();
                checarVisibilidadeDoBotaoDepoisClicar(botaoExcluirProduto);
                cy.wait(1000);
                checarFiltroDeProdutoPedidoAuto(itemParcial, true);
            });
    });
}

export function checarSituacao(situacao) {
    cy.get('[data-testid="cabecalho-cotacao-situacao"]')
        .contains(situacao)
        .should("be.visible");
}

export function passarParaProximaSituacao(situacaoAtual, cotacao) {
    if (situacaoAtual === "Em Andamento") {
        checarVisibilidadeDoBotaoDepoisClicar(botaoEncerrarCotacao); // esta em andamento, eu encerro para passar para em analise
    } else if (situacaoAtual === "Em Analise") {
        processarPedidoAuto(cotacao, false, false); // esta em analise, processo para entrar em criacao (false: pq nao precisa encerrar a cotacao)
    } else if (situacaoAtual === "Em criação") {
        cy.get("button")
            .should("be.visible")
            .contains(botaoConfirmarPedido)
            .click(); // esta em criacao, clico em confirmar para ir para confirmado
        cy.wait(4000); // espero um pouco porque demora para renderizar a pagina
        cy.get('[data-testid="page-pedido-revisao-envio"]')
            .find('[role="button"]')
            .find("span")
            .contains("Resumo dos Pedidos");
        cy.get(
            '[class*="MuiPaper-root MuiPaper-elevation MuiPaper-elevation0 MuiAccordion-root"]'
        )
            .find("strong")
            .contains(" - Pedido Confirmado")
            .should("be.visible");
    }
}

export function checagemGeralSituacao(cotacao) {
    listaSituacoes.forEach((situacao) => {
        checarSituacao(situacao);
        passarParaProximaSituacao(situacao, cotacao);
    });
}

export function marcarCheckTodos() {
    cy.get("#check-all-products")
        .invoke("prop", "checked")
        .then((statusCheck) => {
            if (!statusCheck) {
                cy.get("#check-all-products").click();
            }
        });
}

export function fazerRequestGetFornecedorPaginado(
    page,
    size,
    token,
    quantidadePagina = 0
) {
    cy.request({
        method: "GET",
        url: `${URL_AUTH_DEMO}/pedidoAutomatico/125187/fornecedores?busca=&idCliente=0&idFornecedor=0&idRepresentante=0&acimaDoValor=true&tipoComparacao=0&filtroPorcentagem=true&conflitoDeEmbalagem=false&problemaFaturamentoMinimo=false&problemaDeMinimo=false&oportunidade=false&combo=false&valor=0.00&sort=&asc=true&page=${page}&size=${size}`,
        headers: {
            Authorization: `Bearer ${token}`, // Adiciona o token como Bearer
        },
    }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property("content");
        expect(response.body.content).to.not.be.empty;
        if (quantidadePagina) {
            expect(response.body.numberOfElements).to.eq(quantidadePagina);
        } else {
            expect(response.body.numberOfElements).to.eq(size);
        }
        expect(response.body.size).to.eq(size);
        if (size == 5) {
            expect(response.body.totalPages).to.eq(7);
        } else if (size == 10) {
            expect(response.body.totalPages).to.eq(4);
        } else if (size == 20) {
            expect(response.body.totalPages).to.eq(2);
        } else {
            expect(response.body.totalPages).to.eq(1);
        }
        expect(response.body.totalElements).to.eq(34);
    });
}

function filtrarPorFornecedor() {
    cy.get('[data-testid="content-filter-pedido-automatico"]')
        .find('[name="idFornecedor"]')
        .should("be.visible")
        .select("DROGACENTER - SP/SPI X");
    cy.get('[class="MuiAccordion-region"]')
        .find("button")
        .contains("Filtrar")
        .click();
}

function desmarcaUmPedido() {
    abrirAcordeonPrimeiroPedido();
    cy.get('[class="MuiAccordion-region"]')
        .eq(1)
        .find('[type="checkbox"]')
        .first()
        .click();
}

function checarExclusao() {
    cy.wait(5000); //wait necessario para terminar de carregar a exclusão
    cy.get('[data-testid="filial-pedido-automatico"]').then((pedidos) => {
        const countPed = pedidos.length;
        if (countPed === 1) {
            cy.get('[class="content"]')
                .find("button")
                .contains("Limpar")
                .click();
        } else {
            cy.fail("Quantidade não esperada de pedidos após a exclusão");
        }
    });
}

export function testarExclusaoComFiltro() {
    cy.wait(5000); // espero um pouco para carregar os pedidos em tela
    cy.get('[data-testid="filial-pedido-automatico"]').then((allPedidos) => {
        const countPedidos = allPedidos.length;
        if (countPedidos === 13) {
            filtrarPorFornecedor();
            marcarCheckTodos();
            desmarcaUmPedido();
            checarVisibilidadeDoBotaoDepoisClicar(botaoExcluirProduto);
            checarExclusao();
            cy.get('[class="estiloExcluirPedido"]').then(
                (allPedidosPosExclusao) => {
                    const countPedidosPosExclusao =
                        allPedidosPosExclusao.length;
                    if (!countPedidosPosExclusao === 9) {
                        cy.fail(
                            "Quantidade de pedidos em tela não esperada após count total"
                        );
                    }
                }
            );
        } else {
            cy.fail(
                "Quantidade de pedidos não corresponde a esperada que é de 13 pedidos"
            );
        }
    });
}
