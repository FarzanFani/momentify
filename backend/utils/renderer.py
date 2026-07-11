from rest_framework.renderers import JSONRenderer


class CustomJSONRenderer(JSONRenderer):
    def render(self, data, accepted_media_type=None, renderer_context=None):
        response = renderer_context.get("response") if renderer_context else None

        # If the response is already wrapped (by exception handler or manually), pass through
        if isinstance(data, dict) and "success" in data and "message" in data:
            return super().render(data, accepted_media_type, renderer_context)

        # Wrap successful responses
        if response and response.status_code < 400:
            data = {
                "success": True,
                "message": "Success",
                "data": data,
                "errors": None,
            }

        return super().render(data, accepted_media_type, renderer_context)
