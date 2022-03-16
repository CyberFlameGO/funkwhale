// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import logger from '@/logging'
import jQuery from 'jquery'

import Vue from 'vue'
import moment from 'moment'
import App from './App'
import router from './router'
import axios from 'axios'
import VueLazyload from 'vue-lazyload'
import store from './store'
import GetTextPlugin from 'vue-gettext'
import { sync } from 'vuex-router-sync'
import locales from '@/locales'
import createAuthRefreshInterceptor from 'axios-auth-refresh'

import filters from '@/filters' // eslint-disable-line
import { parseAPIErrors } from '@/utils'
import globals from '@/components/globals' // eslint-disable-line
import './registerServiceWorker'

logger.default.info('Loading environment:', process.env.NODE_ENV)
logger.default.debug('Environment variables:', process.env)

sync(store, router)

window.$ = window.jQuery = require('jquery')
require('./semantic.js')
let APP = null

const availableLanguages = (function () {
  const l = {}
  locales.locales.forEach(c => {
    l[c.code] = c.label
  })
  return l
})()
let defaultLanguage = 'en_US'
if (availableLanguages[store.state.ui.currentLanguage]) {
  defaultLanguage = store.state.ui.currentLanguage
}
Vue.use(GetTextPlugin, {
  availableLanguages: availableLanguages,
  defaultLanguage: defaultLanguage,
  // cf https://github.com/Polyconseil/vue-gettext#configuration
  // not recommended but this is fixing weird bugs with translation nodes
  // not being updated when in v-if/v-else clauses
  autoAddKeyAttributes: true,
  languageVmMixin: {
    computed: {
      currentKebabCase: function () {
        return this.current.toLowerCase().replace('_', '-')
      }
    }
  },
  translations: {},
  silent: true
})

Vue.use(VueLazyload)
Vue.config.productionTip = false
Vue.directive('title', function (el, binding) {
  store.commit('ui/pageTitle', binding.value)
})
Vue.directive('dropdown', function (el, binding) {
  jQuery(el).dropdown({
    selectOnKeydown: false,
    action: function (text, value, $el) {
      // used to ensure focusing the dropdown and clicking via keyboard
      // works as expected
      const button = $el[0]
      button.click()
      jQuery(el).find('.ui.dropdown').dropdown('hide')
    },
    ...(binding.value || {})
  })
})
axios.defaults.xsrfCookieName = 'csrftoken'
axios.defaults.xsrfHeaderName = 'X-CSRFToken'
axios.interceptors.request.use(function (config) {
  // Do something before request is sent
  if (store.state.auth.oauth.accessToken) {
    config.headers.Authorization = store.getters['auth/header']
  }
  return config
}, function (error) {
  // Do something with request error
  return Promise.reject(error)
})

// Add a response interceptor
axios.interceptors.response.use(function (response) {
  return response
}, function (error) {
  error.backendErrors = []
  if (store.state.auth.authenticated && !store.state.auth.oauth.accessToken && error.response.status === 401) {
    store.commit('auth/authenticated', false)
    logger.default.warn('Received 401 response from API, redirecting to login form', router.currentRoute.fullPath)
    router.push({ name: 'login', query: { next: router.currentRoute.fullPath } })
  }
  if (error.response.status === 404) {
    error.backendErrors.push('Resource not found')
    const message = error.response.data
    store.commit('ui/addMessage', {
      content: message,
      class: 'error'
    })
  } else if (error.response.status === 403) {
    error.backendErrors.push('Permission denied')
  } else if (error.response.status === 429) {
    let message
    const rateLimitStatus = {
      limit: error.response.headers['x-ratelimit-limit'],
      scope: error.response.headers['x-ratelimit-scope'],
      remaining: error.response.headers['x-ratelimit-remaining'],
      duration: error.response.headers['x-ratelimit-duration'],
      availableSeconds: error.response.headers['retry-after'],
      reset: error.response.headers['x-ratelimit-reset'],
      resetSeconds: error.response.headers['x-ratelimit-resetseconds']
    }
    if (rateLimitStatus.availableSeconds) {
      rateLimitStatus.availableSeconds = parseInt(rateLimitStatus.availableSeconds)
      const tryAgain = moment().add(rateLimitStatus.availableSeconds, 's').toNow(true)
      message = APP.$pgettext('*/Error/Paragraph', 'You sent too many requests and have been rate limited, please try again in %{ delay }')
      message = APP.$gettextInterpolate(message, { delay: tryAgain })
    } else {
      message = APP.$pgettext('*/Error/Paragraph', 'You sent too many requests and have been rate limited, please try again later')
    }
    error.backendErrors.push(message)
    store.commit('ui/addMessage', {
      content: message,
      date: new Date(),
      class: 'error'
    })
    logger.default.error('This client is rate-limited!', rateLimitStatus)
  } else if (error.response.status === 500) {
    error.backendErrors.push('A server error occured')
  } else if (error.response.data) {
    if (error.response.data.detail) {
      error.backendErrors.push(error.response.data.detail)
    } else {
      error.rawPayload = error.response.data
      const parsedErrors = parseAPIErrors(error.response.data)
      error.backendErrors = [...error.backendErrors, ...parsedErrors]
    }
  }
  if (error.backendErrors.length === 0) {
    error.backendErrors.push('An unknown error occured, ensure your are connected to the internet and your funkwhale instance is up and running')
  }
  // Do something with response error
  return Promise.reject(error)
})

const refreshAuth = (failedRequest) => {
  if (store.state.auth.oauth.accessToken) {
    console.log('Failed request, refreshing auth…')
    // maybe the token was expired, let's try to refresh it
    return store.dispatch('auth/refreshOauthToken').then(() => {
      failedRequest.response.config.headers.Authorization = store.getters['auth/header']
      return Promise.resolve()
    })
  } else {
    return Promise.resolve()
  }
}

createAuthRefreshInterceptor(axios, refreshAuth)

store.dispatch('instance/fetchFrontSettings').finally(() => {
  /* eslint-disable no-new */
  new Vue({
    el: '#app',
    router,
    store,
    components: { App },
    created () {
      APP = this
      window.addEventListener('resize', this.handleResize)
      this.handleResize()
    },
    destroyed () {
      window.removeEventListener('resize', this.handleResize)
    },
    methods: {
      handleResize () {
        this.$store.commit('ui/window', {
          width: window.innerWidth,
          height: window.innerHeight
        })
      }
    },
    render (h) {
      return h('App')
    }
  })

  logger.default.info('Everything loaded!')
})
