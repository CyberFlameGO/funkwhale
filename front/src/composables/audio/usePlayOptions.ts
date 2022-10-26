import type { Track, Artist, Album, Playlist, Library, Channel, Actor } from '~/types'
import type { ContentFilter } from '~/store/moderation'

import { useCurrentElement } from '@vueuse/core'
import { computed, markRaw, ref } from 'vue'
import { useGettext } from 'vue3-gettext'
import { useStore } from '~/store'

import axios from 'axios'
import jQuery from 'jquery'

import { enqueue as addToQueue, currentTrack, playNext, currentIndex, enqueueAt, queue } from '~/composables/audio/queue'
import { isPlaying } from '~/composables/audio/player'

export interface PlayOptionsProps {
  isPlayable?: boolean
  tracks?: Track[]
  track?: Track | null
  artist?: Artist | null
  album?: Album | null
  playlist?: Playlist | null
  library?: Library | null
  channel?: Channel | null
  account?: Actor | null
}

export default (props: PlayOptionsProps) => {
  const store = useStore()

  const playable = computed(() => {
    if (props.isPlayable) {
      return true
    }

    if (props.track) {
      return props.track.uploads?.length > 0
    } else if (props.artist) {
      return props.artist.tracks_count > 0
        || props.artist?.albums?.some((album) => album.is_playable === true)
    } else if (props.tracks) {
      return props.tracks?.some((track) => (track.uploads?.length ?? 0) > 0)
    }

    return false
  })

  const filterableArtist = computed(() => props.track?.artist ?? props.album?.artist ?? props.artist)
  const filterArtist = async () => store.dispatch('moderation/hide', { type: 'artist', target: filterableArtist.value })

  const { $npgettext } = useGettext()
  const addMessage = (tracks: Track[]) => {
    if (!tracks.length) {
      return
    }

    store.commit('ui/addMessage', {
      content: $npgettext('*/Queue/Message', '%{ count } track was added to your queue', '%{ count } tracks were added to your queue', tracks.length, {
        count: tracks.length.toString()
      }),
      date: new Date()
    })
  }

  const getTracksPage = async (params: object, page = 1, tracks: Track[] = []): Promise<Track[]> => {
    if (page > 11) {
      // it's 10 * 100 tracks already, let's stop here
      return tracks
    }

    // when fetching artists/or album tracks, sometimes, we may have to fetch
    // multiple pages
    const response = await axios.get('tracks/', {
      params: {
        ...params,
        page_size: 100,
        page,
        hidden: '',
        playable: true
      }
    })

    tracks.push(...response.data.results)
    if (response.data.next) {
      return getTracksPage(params, page + 1, tracks)
    }

    return tracks
  }

  const isLoading = ref(false)
  const getPlayableTracks = async () => {
    isLoading.value = true

    const tracks: Track[] = []

    // TODO (wvffle): Why is there no channel?
    if (props.tracks?.length) {
      tracks.push(...props.tracks)
    } else if (props.track) {
      if (props.track.uploads?.length) {
        tracks.push(props.track)
      } else {
        // fetch uploads from api
        const response = await axios.get(`tracks/${props.track.id}/`)
        tracks.push(response.data as Track)
      }
    } else if (props.playlist) {
      const response = await axios.get(`playlists/${props.playlist.id}/tracks/`)
      const playlistTracks = (response.data.results as Array<{ track: Track }>).map(({ track }) => track as Track)

      const artistIds = store.getters['moderation/artistFilters']().map((filter: ContentFilter) => filter.target.id)
      if (artistIds.length) {
        tracks.push(...playlistTracks.filter((track) => {
          return !((artistIds.includes(track.artist?.id) || track.album) && artistIds.includes(track.album?.artist.id))
        }))
      } else {
        tracks.push(...playlistTracks)
      }
    } else if (props.artist) {
      tracks.push(...await getTracksPage({ artist: props.artist.id, include_channels: 'true', ordering: 'album__release_date,disc_number,position' }))
    } else if (props.album) {
      tracks.push(...await getTracksPage({ album: props.album.id, include_channels: 'true', ordering: 'disc_number,position' }))
    } else if (props.library) {
      tracks.push(...await getTracksPage({ library: props.library.uuid, ordering: '-creation_date' }))
    }

    isLoading.value = false

    return tracks.filter(track => track.uploads?.length).map(markRaw)
  }

  const el = useCurrentElement()
  const enqueue = async () => {
    jQuery(el.value).find('.ui.dropdown').dropdown('hide')

    const tracks = await getPlayableTracks()
    await addToQueue(...tracks)
    addMessage(tracks)
  }

  const enqueueNext = async (next = false) => {
    jQuery(el.value).find('.ui.dropdown').dropdown('hide')

    const tracks = await getPlayableTracks()

    const wasEmpty = queue.value.length === 0
    await enqueueAt(currentIndex.value + 1, ...tracks)

    if (next && !wasEmpty) {
      await playNext()
      isPlaying.value = true
    }

    addMessage(tracks)
  }

  const replacePlay = async () => {
    const { tracks, playTrack } = await import('~/composables/audio/queue')
    tracks.value.length = 0

    jQuery(el.value).find('.ui.dropdown').dropdown('hide')

    const tracksToPlay = await getPlayableTracks()
    await addToQueue(...tracksToPlay)

    const trackIndex = props.tracks?.findIndex(track => track.id === props.track?.id && track.position === props.track?.position) ?? 0
    await playTrack(trackIndex)

    isPlaying.value = true
    playTrack(0, true)
    addMessage(tracksToPlay)
  }

  const activateTrack = (track: Track, index: number) => {
    // TODO (wvffle): Check if position checking did not break anything
    if (track.id === currentTrack.value?.id && track.position === currentTrack.value?.position) {
      isPlaying.value = true
    }

    replacePlay()
  }

  return {
    playable,
    filterableArtist,
    filterArtist,
    enqueue,
    enqueueNext,
    replacePlay,
    activateTrack,
    isLoading
  }
}
