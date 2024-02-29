create table water_locs (
	id serial primary key, 
	name varchar(255), 
	image_path varchar(255), 
	longitude float, 
	latitude float, 
	epoch_added int
);

create table water_tests (
	id serial primary key, 
	user_id int, 
	loc_id int, 
	temperature float, 
	ph float, 
	tds float, 
	epoch int
); 
