from drf_spectacular.contrib.django_oauth_toolkit import OpenApiAuthenticationExtension

class CustomOAuthExt(OpenApiAuthenticationExtension):
    target_class = "funkwhale_api.common.authentication.OAuth2Authentication"
    name = "oauth2"

    def get_security_definition(self, auto_schema):
        from oauth2_provider.scopes import get_scopes_backend

        from drf_spectacular.settings import spectacular_settings

        flows = {}
        for flow_type in spectacular_settings.OAUTH2_FLOWS:
            flows[flow_type] = {}
            if flow_type in ("implicit", "authorizationCode"):
                flows[flow_type][
                    "authorizationUrl"
                ] = spectacular_settings.OAUTH2_AUTHORIZATION_URL
            if flow_type in ("password", "clientCredentials", "authorizationCode"):
                flows[flow_type]["tokenUrl"] = spectacular_settings.OAUTH2_TOKEN_URL
            if spectacular_settings.OAUTH2_REFRESH_URL:
                flows[flow_type]["refreshUrl"] = spectacular_settings.OAUTH2_REFRESH_URL
            scope_backend = get_scopes_backend()
            flows[flow_type]["scopes"] = scope_backend.get_all_scopes()

        return {"type": "oauth2", "flows": flows}
