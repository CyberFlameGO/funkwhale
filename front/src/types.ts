import type { App } from '@vue/composition-api'
import type { Store } from 'vuex'
import type VueRouter from 'vue-router'

declare global {
  interface Window {
    $: JQueryStatic
    jQuery: JQueryStatic
  }
}

// App structure stuff
export interface AppModuleContext {
  app: App
  router: VueRouter
  store: Store<any>
}

export type AppModule = (ctx: AppModuleContext) => void

// Theme stuff
export type Theme = 'auto' | 'light' | 'dark'

export interface ThemeEntry {
  icon: string
  name: string
  key: Theme
}

// Locale stuff
export interface Locale {
  label: string
  code: string
}

// Track stuff
export interface Artist {
  name: string
}

export interface Album {
  artist: Artist
}

export interface Track {
  title: string
  album?: Album
  artist?: Artist
}

// API stuff
export interface APIErrorResponse {
  [key: string]: APIErrorResponse | string[]
}

// WebSocket stuff
export interface PendingReviewEditsWSEvent {
  pending_review_count: number
}

export interface PendingReviewReportsWSEvent {
  unresolved_count: number
}

export interface PendingReviewRequestsWSEvent {
  pending_count: number
}

export interface ListenWsEventObject {
  local_id: string
}

export interface ListenWSEvent {
  actor: ListenWsEventObject
  object: ListenWsEventObject
}

export type WebSocketEvent = PendingReviewEditsWSEvent | PendingReviewReportsWSEvent | PendingReviewRequestsWSEvent | ListenWSEvent
