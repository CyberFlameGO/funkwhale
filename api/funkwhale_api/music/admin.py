from django.contrib import admin

from . import models


@admin.register(models.Artist)
class ArtistAdmin(admin.ModelAdmin):
    list_display = ["name", "mbid", "creation_date"]
    search_fields = ["name", "mbid"]


@admin.register(models.Album)
class AlbumAdmin(admin.ModelAdmin):
    list_display = ["title", "artist", "mbid", "release_date", "creation_date"]
    search_fields = ["title", "artist__name", "mbid"]
    list_select_related = True


@admin.register(models.Track)
class TrackAdmin(admin.ModelAdmin):
    list_display = ["title", "artist", "album", "mbid"]
    search_fields = ["title", "artist__name", "album__title", "mbid"]
    list_select_related = True


@admin.register(models.ImportBatch)
class ImportBatchAdmin(admin.ModelAdmin):
    list_display = ["submitted_by", "creation_date", "import_request", "status"]
    list_select_related = ["submitted_by", "import_request"]
    list_filter = ["status"]
    search_fields = ["import_request__name", "source", "batch__pk", "mbid"]


@admin.register(models.ImportJob)
class ImportJobAdmin(admin.ModelAdmin):
    list_display = ["source", "batch", "track_file", "status", "mbid"]
    list_select_related = ["track_file", "batch"]
    search_fields = ["source", "batch__pk", "mbid"]
    list_filter = ["status"]


@admin.register(models.Work)
class WorkAdmin(admin.ModelAdmin):
    list_display = ["title", "mbid", "language", "nature"]
    list_select_related = True
    search_fields = ["title"]
    list_filter = ["language", "nature"]


@admin.register(models.Lyrics)
class LyricsAdmin(admin.ModelAdmin):
    list_display = ["url", "id", "url"]
    list_select_related = True
    search_fields = ["url", "work__title"]
    list_filter = ["work__language"]


@admin.register(models.TrackFile)
class TrackFileAdmin(admin.ModelAdmin):
    list_display = [
        "track",
        "audio_file",
        "source",
        "duration",
        "mimetype",
        "size",
        "bitrate",
    ]
    list_select_related = ["track"]
    search_fields = [
        "source",
        "acoustid_track_id",
        "track__title",
        "track__album__title",
        "track__artist__name",
    ]
    list_filter = ["mimetype"]
