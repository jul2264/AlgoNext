from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status


def custom_exception_handler(exc, context):
    """
    Custom exception handler that wraps DRF's default handler
    to provide consistent error response format.
    
    Response format:
    {
        "error": true,
        "message": "...",
        "details": { ... }
    }
    """
    response = exception_handler(exc, context)

    if response is not None:
        custom_response = {
            'error': True,
            'message': _get_error_message(response),
            'details': response.data,
            'status_code': response.status_code,
        }
        response.data = custom_response

    return response


def _get_error_message(response):
    """Extract a human-readable error message from the response."""
    if isinstance(response.data, dict):
        if 'detail' in response.data:
            return str(response.data['detail'])
        # Collect field errors
        messages = []
        for field, errors in response.data.items():
            if isinstance(errors, list):
                messages.append(f"{field}: {', '.join(str(e) for e in errors)}")
            else:
                messages.append(f"{field}: {errors}")
        return '; '.join(messages) if messages else 'An error occurred'
    elif isinstance(response.data, list):
        return '; '.join(str(e) for e in response.data)
    return str(response.data)
