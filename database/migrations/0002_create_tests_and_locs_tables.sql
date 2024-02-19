create table water_locs (id int, name varchar(255), image_path varchar(255), longitude float, latitude float, epoch_added int);
create table water_tests (id int, user_id int, loc_id int, temperature float, ph float, tds float, epoch int); 
