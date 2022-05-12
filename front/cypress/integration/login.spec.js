const username = "testing"
const password = "testing1234"

Cypress.on('uncaught:exception', (err, runnable) => {
    // returning false here prevents Cypress from
    // failing the test
    return false
})

describe('The login', () => {

  it('is working with UI', () => {
    cy.visit('/login')
    cy.get('input[name=username]').type(username)
    cy.get('input[name=password]').type(`${password}{enter}`)
    cy.url().should('include', '/library')

    cy.getCookie('sessionid').should('exist')
  })

  it('is working without UI', () => {
    cy.login(username, password)
    cy.visit('/library')
    cy.get('nav.top').children().should('have.length', 7)
    cy.getCookie('sessionid').should('exist')
  })
})
