import pytest

from funkwhale_api.music import filters
from funkwhale_api.music import models


def test_album_filter_hidden(factories, mocker, queryset_equal_list):
    factories["music.Album"]()
    cf = factories["moderation.UserFilter"](for_artist=True)
    hidden_album = factories["music.Album"](artist=cf.target_artist)

    qs = models.Album.objects.all()
    filterset = filters.AlbumFilter(
        {"hidden": "true"}, request=mocker.Mock(user=cf.user), queryset=qs
    )

    assert filterset.qs == [hidden_album]


def test_artist_filter_hidden(factories, mocker, queryset_equal_list):
    factories["music.Artist"]()
    cf = factories["moderation.UserFilter"](for_artist=True)
    hidden_artist = cf.target_artist

    qs = models.Artist.objects.all()
    filterset = filters.ArtistFilter(
        {"hidden": "true"}, request=mocker.Mock(user=cf.user), queryset=qs
    )

    assert filterset.qs == [hidden_artist]


def test_artist_filter_track_artist(factories, mocker, queryset_equal_list):
    factories["music.Track"]()
    cf = factories["moderation.UserFilter"](for_artist=True)
    hidden_track = factories["music.Track"](artist=cf.target_artist)

    qs = models.Track.objects.all()
    filterset = filters.TrackFilter(
        {"hidden": "true"}, request=mocker.Mock(user=cf.user), queryset=qs
    )

    assert filterset.qs == [hidden_track]


def test_artist_filter_track_album_artist(factories, mocker, queryset_equal_list):
    factories["music.Track"]()
    cf = factories["moderation.UserFilter"](for_artist=True)
    hidden_track = factories["music.Track"](album__artist=cf.target_artist)

    qs = models.Track.objects.all()
    filterset = filters.TrackFilter(
        {"hidden": "true"}, request=mocker.Mock(user=cf.user), queryset=qs
    )

    assert filterset.qs == [hidden_track]


@pytest.mark.parametrize(
    "factory_name, filterset_class",
    [
        ("music.Track", filters.TrackFilter),
        ("music.Artist", filters.TrackFilter),
        ("music.Album", filters.TrackFilter),
    ],
)
def test_track_filter_tag_single(
    factory_name,
    filterset_class,
    factories,
    mocker,
    queryset_equal_list,
    anonymous_user,
):
    factories[factory_name]()
    # tag name partially match the query, so this shouldn't match
    factories[factory_name](set_tags=["TestTag1"])
    tagged = factories[factory_name](set_tags=["TestTag"])
    qs = tagged.__class__.objects.all()
    filterset = filterset_class(
        {"tag": "testTaG"}, request=mocker.Mock(user=anonymous_user), queryset=qs
    )

    assert filterset.qs == [tagged]


@pytest.mark.parametrize(
    "factory_name, filterset_class",
    [
        ("music.Track", filters.TrackFilter),
        ("music.Artist", filters.ArtistFilter),
        ("music.Album", filters.AlbumFilter),
    ],
)
def test_track_filter_tag_multiple(
    factory_name,
    filterset_class,
    factories,
    mocker,
    queryset_equal_list,
    anonymous_user,
):
    factories[factory_name](set_tags=["TestTag1"])
    tagged = factories[factory_name](set_tags=["TestTag1", "TestTag2"])
    qs = tagged.__class__.objects.all()
    filterset = filterset_class(
        {"tag": ["testTaG1", "TestTag2"]},
        request=mocker.Mock(user=anonymous_user),
        queryset=qs,
    )

    assert filterset.qs == [tagged]
