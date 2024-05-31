describe('search', () => {
    it('search for a grid that exists (at least 1), go to the post page', () => {
        cy.visit('/');
        cy.get('[data-cy=search-input]').should('exist').should('be.visible').type('cat');
        cy.get('[data-cy=search-button]').should('exist').should('be.visible').click();
        cy.contains('Search Results for "cat"').should('exist');
        cy.get('[data-cy=clear-button]').should('exist').should('be.visible').then(($btn) => {
            cy.wrap($btn).click();
        });
        cy.wait(1000);
        cy.url().should('include', 'search=cat&criteria=option-title');
        cy.get('[data-cy=post-link-BDtcibm0YU14cs4JzTLq]').should('exist').should('be.visible').click();
        cy.contains('cat').should('exist');
    });
    it('search for a grid that does not exist, go back to home', () => {
        cy.visit('/');
        cy.get('[data-cy=search-input]').should('exist').should('be.visible').type('cat');
        cy.get('[data-cy=search-button]').should('exist').should('be.visible').click();
        cy.wait(3000);
        cy.get('[data-cy=back-home-button]').should('exist').should('be.visible').click();
        cy.get('[data-cy=clear-button]').should('exist').should('be.visible').then(($btn) => {
            cy.wrap($btn).click();
        });
        cy.contains('Create your own grid').should('exist');
    });
    it ('search for a grid, no result', () => {
        cy.visit('/');
        cy.get('[data-cy=search-input]').should('exist').should('be.visible').type('dontexistdontexist');
        cy.get('[data-cy=search-button]').should('exist').should('be.visible').click();
        cy.contains('No results found for "dontexistdontexist"').should('exist');
        cy.get('[data-cy=back-home-button]').should('exist').should('be.visible');
    });
    it ('search from not LandingPage component', () => {
        cy.visit('/view-post/SYu7Wvr5Q0eMDw7ZWeT4');
        cy.get('[data-cy="search-input"]').type('some text{enter}');
        cy.get('[data-cy="search-input"]').type('{enter}');
        cy.contains('some text').should('exist');
    });
})