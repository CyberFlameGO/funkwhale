Cypress.Commands.add('login', (username, password) => {
  cy.request('/login')
  cy.getCookie('csrftoken').then(($cookie) => {
    const csrfToken = $cookie.value
    cy.log(csrfToken)

    cy.request({
      method: 'POST',
      url: '/api/v1/users/login',
      form: true,
      headers: {
        'X-CSRFTOKEN': csrfToken,
        Referer: Cypress.config().baseUrl + '/login',
      },
      body: {
        username,
        password
      },
    })
  })
})
