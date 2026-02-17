from rest_framework.views import exception_handler as drf_exception_handler
from rest_framework.response import Response
from rest_framework import status


def custom_exception_handler(exc, context):
    response = drf_exception_handler(exc, context)

    if response is not None:
        errors = response.data

        # DRF sometimes returns {"detail": "..."} for auth/permission errors
        if isinstance(errors, dict) and "detail" in errors:
            message = str(errors["detail"])
            errors = None
        else:
            message = "Validation error"

        response.data = {
            "success": False,
            "message": message,
            "data": None,
            "errors": errors,
        }

    return response
