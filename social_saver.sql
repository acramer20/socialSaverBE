\echo 'Delete and recreate social_saver db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE social_saver;
CREATE DATABASE social_saver;
\connect social_saver

\i social_saver_schema.sql
\i social_saver-seed.sql

\echo 'Delete and recreate social_saver_test db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE social_saver_test;
CREATE DATABASE social_saver_test;
\connect social_saver_test
