"""
Cross-cutting infrastructure: configuration, database connectivity and
authentication.

Everything here is depended on by the feature layers (routes, services,
repositories) and depends on none of them, so imports only ever point inward.
"""
