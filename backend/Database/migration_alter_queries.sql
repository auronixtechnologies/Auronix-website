-- Incremental schema changes, applied on every startup by app/core/db.py init_db().
--
-- Every statement must be idempotent (IF NOT EXISTS / IF EXISTS), because this
-- file is replayed in full on each boot.
--
-- init_db splits this file on the semicolon character, with no awareness of
-- quoting or comments. So keep one statement per terminator, and do not use
-- that character anywhere else in this file -- not even inside a comment.

-- projects.category
-- Read and written by ProjectRepository but absent from schemas.sql, so a
-- database created from scratch had no such column and every project query
-- failed. Listed here as well so existing databases pick it up.
ALTER TABLE projects
    ADD COLUMN IF NOT EXISTS category VARCHAR(100) NOT NULL DEFAULT 'Student Projects';
