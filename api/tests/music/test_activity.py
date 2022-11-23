from funkwhale_api.music import serializers, signals


def test_get_track_activity_url_mbid(factories):
    track = factories["music.Track"]()
    expected = "https://musicbrainz.org/recording/{}".format(track.mbid)
    assert track.get_activity_url() == expected


def test_get_track_activity_url_no_mbid(settings, factories):
    track = factories["music.Track"](mbid=None)
    expected = settings.FUNKWHALE_URL + "/tracks/{}".format(track.pk)
    assert track.get_activity_url() == expected


def test_upload_import_status_updated_broadcast(factories, mocker):
    group_send = mocker.patch("funkwhale_api.common.channels.group_send")
    user = factories["users.User"]()
    upload = factories["music.Upload"](
        import_status="finished", library__actor__user=user
    )
    signals.upload_import_status_updated.send(
        sender=None, upload=upload, old_status="pending", new_status="finished"
    )
    group_send.assert_called_once_with(
        "user.{}.imports".format(user.pk),
        {
            "type": "event.send",
            "text": "",
            "data": {
                "type": "import.status_updated",
                "old_status": "pending",
                "new_status": "finished",
                "upload": serializers.UploadForOwnerSerializer(upload).data,
            },
        },
    )
