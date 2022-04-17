import { startCase } from 'lodash-es'
import { Store } from 'vuex'
import VueRouter from 'vue-router'
import { APIErrorResponse } from '@/types'

export function setUpdate (obj: object, statuses: { [key: string]: unknown }, value: unknown) {
  for (const key of Object.keys(obj)) {
    statuses[key] = value
  }
}

export function parseAPIErrors (responseData: APIErrorResponse, parentField?: string): string[] {
  const errors = []
  for (const field in responseData) {
    if (Object.prototype.hasOwnProperty.call(responseData, field)) {
      let fieldName = startCase(field.replace('_', ' '))
      if (parentField) {
        fieldName = `${parentField} - ${fieldName}`
      }

      const value = responseData[field]
      if (value as string[]) {
        errors.push(...(value as string[]).map(err => {
          return err.toLocaleLowerCase().includes('this field ')
            ? `${fieldName}: ${err}`
            : err
        }))
      } else if (value as APIErrorResponse) {
        // nested errors
        const nestedErrors = parseAPIErrors(value as APIErrorResponse, fieldName)
        errors.push(...nestedErrors)
      }
    }
  }

  return errors
}

export function getCookie (name: string) {
  return document.cookie
    .split('; ')
    .find(row => row.startsWith(name))
    ?.split('=')[1]
}

export function setCsrf (xhr: XMLHttpRequest) {
  const token = getCookie('csrftoken')
  if (token) {
    xhr.setRequestHeader('X-CSRFToken', token)
  }
}

export async function checkRedirectToLogin (store: Store<any>, router: VueRouter) {
  if (!store.state.auth.authenticated) {
    return router.push({ name: 'login', query: { next: router.currentRoute.fullPath } })
  }
}

export function getDomain (url: string) {
  const parser = document.createElement('a')
  parser.href = url
  return parser.hostname
}
