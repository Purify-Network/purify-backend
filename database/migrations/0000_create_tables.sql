-- Create database tables
create table users (
    id serial primary key,
    email varchar(255) unique not null,
    username varchar(255) unique not null,
    name varchar(255) not null,
    created_at timestamp default now()
);
