const email = 'test@gmail.com';
const password = 'password';

describe('Image Upload and Grid Generation', () => {
    before(() => {
        // Log user in via email/password before each test
        cy.visit('/');
        cy.get('[data-cy=login-button]').should('exist').should('be.visible').click();
        cy.get('[data-cy=login-modal]').should('exist').should('be.visible');
        cy.get('[data-cy=email-input]').should('exist').should('be.visible').type(email);
        cy.get('[data-cy=password-input]').should('exist').should('be.visible').type(password);
        cy.get('[data-cy=confirm-login]').should('exist').should('be.visible').click();
        cy.get('[data-cy=user-profile-icon]', { timeout: 6000 }).should('exist').should('be.visible');
        cy.get('[data-cy=upload-image]').should('exist').should('be.visible').click();
    });

    beforeEach(() => {
        cy.visit('/');
        cy.get('[data-cy=upload-image]').should('exist').should('be.visible').click();
    });

    it('should allow user to upload an image', () => {
        // Click the upload button
        cy.get('[data-cy=upload-button]').should('exist').should('be.visible').click();
        // Select a file to upload
        cy.get('[data-cy=file-input]').attachFile('example.jpg'); // Place 'example.jpg' in the cypress/fixtures folder
        // Check if the preview image is displayed
        cy.get('[data-cy=preview-img]').should('exist').should('be.visible');
    });

    it('should generate a grid with valid inputs', () => {
        // Upload an image
        cy.get('[data-cy=upload-button]').click();
        cy.get('[data-cy=file-input]').attachFile('example.jpg');
        // Enter grid details
        cy.get('[data-cy=grid-name-input]').type('My Grid');
        cy.get('[data-cy=no-colors-input]').type('5');
        cy.get('[data-cy=no-blocks-input]').type('10');
        cy.get('[data-cy=scale-factor-input]').type('1.5');
        cy.get('[data-cy=horizontal-toggle]').click();
        cy.get('[data-cy=grid-yes-toggle]').click();
        cy.get('[data-cy=thick-line-frequency-input]').type('3');
        // Click generate button
        cy.get('[data-cy=generate-button]').click();
        // Check if the processing overlay appears
        cy.get('[data-cy=color-carousel]').should('exist').should('be.visible');
    });

    it('should handle invalid inputs gracefully', () => {
        // Upload an image
        cy.get('[data-cy=upload-button]').click();
        cy.get('[data-cy=file-input]').attachFile('example.jpg');
        // Enter invalid grid details
        cy.get('[data-cy=grid-name-input]').clear();
        cy.get('[data-cy=no-colors-input]').clear().type('0');
        cy.get('[data-cy=no-blocks-input]').clear().type('-1');
        cy.get('[data-cy=scale-factor-input]').clear().type('0');
        // Click generate button
        cy.get('[data-cy=generate-button]').click();
        // Check for validation alerts
        cy.on('window:alert', (str) => {
            expect(str).to.contain('Please provide a name for the grid');
        });
    });

    it('should allow user to discard and re-upload an image', () => {
        // Upload an image
        cy.get('[data-cy=upload-button]').click();
        cy.get('[data-cy=file-input]').attachFile('example.jpg');
        // Check if the preview image is displayed
        cy.get('[data-cy=preview-img]').should('exist').should('be.visible');
        // Discard the image
        cy.get('[data-cy=remove-image-button]').click();
        // Ensure the upload button is visible again
        cy.get('[data-cy=upload-button]').should('exist').should('be.visible');
    });

    it('should allow logged-in users to save and publish generated grids', () => {
        // Upload an image
        cy.get('[data-cy=upload-button]').click();
        cy.get('[data-cy=file-input]').attachFile('example.jpg');
        // Enter grid details
        cy.get('[data-cy=grid-name-input]').type('My Grid');
        cy.get('[data-cy=no-colors-input]').type('5');
        cy.get('[data-cy=no-blocks-input]').type('10');
        cy.get('[data-cy=scale-factor-input]').type('1.5');
        cy.get('[data-cy=horizontal-toggle]').click();
        cy.get('[data-cy=grid-yes-toggle]').click();
        cy.get('[data-cy=thick-line-frequency-input]').type('3');
        // Click generate button
        cy.get('[data-cy=generate-button]').click();
        // Wait for grid to be generated
        cy.get('[data-cy=save-button]').should('exist').should('be.visible').click();
        cy.get('[data-cy="save-modal-button"]').should('exist').should('be.visible').click();
        cy.get('[data-cy="view-post-button"]').should('exist').should('be.visible').click();
        cy.wait(3000);
        cy.get('[data-cy="delete-grid"]').should('exist').should('be.visible').click();
        cy.get('[data-cy="delete-grid-confirm"]').should('exist').should('be.visible').click();
        cy.url().should('eq', 'http://localhost:8080/');
    });
});
