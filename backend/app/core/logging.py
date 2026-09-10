"""
Logging setup.

The application previously wrote diagnostics with print(), which gives no
levels, no timestamps and no way to quieten output in production. Everything
now goes through the standard logging module, configured once from here.
"""

import logging
import sys

from app.core.config import config

LOG_FORMAT = "%(asctime)s %(levelname)-8s %(name)s: %(message)s"
DATE_FORMAT = "%Y-%m-%d %H:%M:%S"


def configure_logging() -> None:
    """
    Install a single stdout handler on the root logger.

    stdout rather than stderr because container platforms (Render included)
    collect it as the normal application log stream.

    DEBUG applies to our own "app.*" loggers only. Setting the root logger to
    DEBUG turns on every third-party library's internal logging too — Pillow
    alone emits a line per image plugin it probes — which buries anything
    useful.
    """
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(logging.Formatter(LOG_FORMAT, datefmt=DATE_FORMAT))

    root = logging.getLogger()
    root.handlers.clear()
    root.addHandler(handler)
    root.setLevel(logging.INFO)

    logging.getLogger("app").setLevel(logging.DEBUG if config.DEBUG else logging.INFO)

    # uvicorn installs its own handlers; let them propagate to ours instead so
    # application and server logs share one format.
    for name in ("uvicorn", "uvicorn.error", "uvicorn.access"):
        uvicorn_logger = logging.getLogger(name)
        uvicorn_logger.handlers.clear()
        uvicorn_logger.propagate = True


def get_logger(name: str) -> logging.Logger:
    """Return a module-scoped logger. Use as: logger = get_logger(__name__)."""
    return logging.getLogger(name)
