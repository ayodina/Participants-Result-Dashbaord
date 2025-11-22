-- Add new columns for contact and location details
alter table students add column if not exists parish text;
alter table students add column if not exists deanery text;
alter table students add column if not exists phone text;
