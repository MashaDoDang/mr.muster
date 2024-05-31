const ex_email = 'test2323@gmail.com';
const new_email = 'tes337653@gmail.com';
const password = 'password';
const ex_username = 'test2323';
const new_username = 'test337653';

describe('registration', () => {
    // it('register user via email/password, display user icon and log out', () => {
    //     cy.visit('/');
    //     cy.get('[data-cy=register-button]').should('exist').should('be.visible').then(($btn) => {
    //         cy.wrap($btn).click();
    //     });
    //     cy.get('[data-cy=login-modal]').should('exist').should('be.visible');
    //     cy.get('[data-cy=username-input]').should('exist').should('be.visible').type(new_username);
    //     cy.get('[data-cy=email-input]').should('exist').should('be.visible').type(new_email);
    //     cy.get('[data-cy=password-input]').should('exist').should('be.visible').type(password);
    //     cy.get('[data-cy=confirm-password-input]').should('exist').should('be.visible').type(password);
    //     cy.get('[data-cy=create-account-button]').should('exist').should('be.visible').click();
    //     cy.window().then((win) => {
    //     cy.stub(win, 'alert').as('alert');
    //     });
    //     cy.get('@alert').should('have.been.calledWithMatch', 'Your account has been created!');
    //     cy.get('[data-cy=logout-button]').should('exist').should('be.visible').then(($btn) => {
    //         cy.wrap($btn).click();
    //     });
    // });
    it('register with existing email', () => {
        cy.visit('/');
        cy.get('[data-cy=register-button]').should('exist').should('be.visible').then(($btn) => {
            cy.wrap($btn).click();
        });
        cy.get('[data-cy=login-modal]').should('exist').should('be.visible');
        cy.get('[data-cy=username-input]').should('exist').should('be.visible').type(ex_username);
        cy.get('[data-cy=email-input]').should('exist').should('be.visible').type(ex_email);
        cy.get('[data-cy=password-input]').should('exist').should('be.visible').type(password);
        cy.get('[data-cy=confirm-password-input]').should('exist').should('be.visible').type(password);
        cy.get('[data-cy=create-account-button]').should('exist').should('be.visible').click();
        cy.window().then((win) => {
        cy.stub(win, 'alert').as('alert');
        });
        cy.get('@alert').should('have.been.calledWithMatch', 'This email is already in use by another account');
    });
});