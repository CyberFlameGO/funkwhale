// Currently we cannot login purely programatically, so we need to use the
// graphical login until the vue3 branch is merged
//Cypress.Commands.add('login', (username, password) => {
//  cy.request('/login')
//  cy.getCookie('csrftoken').then(($cookie) => {
//    const csrfToken = $cookie.value
//    cy.log(csrfToken)
//
//    cy.request({
//      method: 'POST',
//      url: '/api/v1/users/login',
//      form: true,
//      headers: {
//        'X-CSRFTOKEN': csrfToken,
//        Referer: Cypress.config().baseUrl + '/login',
//      },
//      body: {
//        username,
//        password
//      },
//    })
//  })
//})

Cypress.Commands.add('login', (username, password) => {
  cy.visit('/login')
  cy.get('input[name=username]').type(username)
  cy.get('input[name=password]').type(`${password}{enter}`)
})
