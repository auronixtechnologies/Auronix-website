"""
Utility functions for image handling and conversion.
"""

import base64
from typing import Optional, Tuple


def convert_base64_to_binary(base64_str: Optional[str]) -> Optional[bytes]:
    """
    Convert base64 encoded image string to binary data.
    
    Args:
        base64_str: Base64 encoded image string (with or without data URI prefix)
    
    Returns:
        Binary image data or None
    """
    if not base64_str:
        return None
    
    try:
        # Remove data URI prefix if present (e.g., 'data:image/jpeg;base64,')
        if ',' in base64_str:
            base64_str = base64_str.split(',')[1]
        
        # Decode base64 to binary
        return base64.b64decode(base64_str)
    except Exception as e:
        print(f"Error converting base64 to binary: {e}")
        return None


def convert_binary_to_base64(binary_data) -> Optional[str]:
    """
    Convert binary image data to base64 encoded string.
    Handles both bytes and memoryview objects.
    
    Args:
        binary_data: Binary image data (bytes or memoryview)
    
    Returns:
        Base64 encoded string or None
    """
    if not binary_data:
        return None
    
    try:
        # Convert memoryview to bytes if needed
        if isinstance(binary_data, memoryview):
            binary_data = bytes(binary_data)
        
        return base64.b64encode(binary_data).decode('utf-8')
    except Exception as e:
        print(f"Error converting binary to base64: {e}")
        return None


def get_data_uri(base64_str: str, mime_type: str = 'image/jpeg') -> str:
    """
    Create a data URI from base64 image string.
    
    Args:
        base64_str: Base64 encoded image string
        mime_type: MIME type of the image
    
    Returns:
        Data URI string for direct use in HTML/CSS
    """
    if not base64_str:
        return ''
    
    return f"data:{mime_type};base64,{base64_str}"
