import { URL_AMPLIFY_DEMO } from "../functions/utils/envVariaveis";

describe("Checar a visualização do chat e dos seus elementos em TODOS os navegadores disponiveis", () => {
    it("Verifica o chat", () => {
        cy.visit(`${URL_AMPLIFY_DEMO}/chat`);
        cy.get('[class="b24-crm-button-chat-icon"]')
            .should("be.visible")
            .click();
        cy.get("#whatsapp").should("be.visible");
        cy.get('a[href="https://instagram.com/cotefacil.oficial/"]').should(
            "be.visible"
        );
        cy.get('a[href="https://m.me/433789409988245"]').should("be.visible");
        cy.get('a[href="https://t.me/CotefacilAtendimento_bot"]').should(
            "be.visible"
        );
        cy.get(
            'a[class="b24-widget-button-social-item b24-widget-button-openline_livechat"'
        ).should("be.visible");
    });
});
