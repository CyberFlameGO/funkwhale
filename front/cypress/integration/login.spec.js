Cypress.on('uncaught:exception', (err, runnable) => {
    // returning false here prevents Cypress from
    // failing the test
    return false
})

describe('The login', () => {

  it('is working with UI', () => {
    cy.login()

    cy.url().should('include', '/library')
    cy.getCookie('sessionid').should('exist')
  })

//  it('is working without UI', () => {
//    cy.login(username, password)
//    cy.visit('/library')
//    cy.get('.ui.avatar.circular.label').should('exist')
//    cy.getCookie('sessionid').should('exist')
//  })
})
