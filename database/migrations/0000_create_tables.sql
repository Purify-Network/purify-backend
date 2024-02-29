-- Create database tables
create table users (
    id serial primary key,
    email varchar(255) unique not null,
    username varchar(255) unique not null,
    password varchar(255) not null,
    name varchar(255) not null,
    epoch_created int default CAST(EXTRACT(epoch FROM NOW()) AS INT)
);
