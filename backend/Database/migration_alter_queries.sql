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

-- project_members foreign keys: enforce ON DELETE CASCADE
-- schemas.sql originally created these without a delete rule, so databases
-- built from it reject any attempt to delete a project or a team member that
-- has memberships. Dropping and re-adding is idempotent, so this is safe to
-- replay on every boot.
ALTER TABLE project_members DROP CONSTRAINT IF EXISTS project_members_project_id_fkey;
ALTER TABLE project_members ADD CONSTRAINT project_members_project_id_fkey FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;
ALTER TABLE project_members DROP CONSTRAINT IF EXISTS project_members_team_member_id_fkey;
ALTER TABLE project_members ADD CONSTRAINT project_members_team_member_id_fkey FOREIGN KEY (team_member_id) REFERENCES team_members(id) ON DELETE CASCADE;
