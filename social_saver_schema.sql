
CREATE TABLE users (
  username VARCHAR(25) PRIMARY KEY,
  password TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL
    CHECK (position('@' IN email) > 1),
  is_admin BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE groups (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  target_goal INTEGER CHECK (target_goal >= 0)
);

CREATE TABLE members (
  id SERIAL PRIMARY KEY, 
  username VARCHAR(25)
    REFERENCES users ON DELETE CASCADE,
  group_id INTEGER
    REFERENCES groups ON DELETE CASCADE,
  admin BOOLEAN NOT NULL DEFAULT FALSE
);
