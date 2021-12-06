const Album = {
  clean (album) {
    // we manually rebind the album and artist to each child track
    album.tracks = album.tracks.map((track) => {
      track.album = album
      return track
    })
    return album
  }
}
const Artist = {
  clean (artist) {
    // clean data as given by the API
    artist.albums = artist.albums.map((album) => {
      return Album.clean(album)
    })
    return artist
  }
}
export default {
  Artist: Artist,
  Album: Album
}
