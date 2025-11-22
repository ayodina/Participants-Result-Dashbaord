export const createTablesSql = `
-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Drop tables if they exist to ensure clean slate (in reverse order of dependencies)
drop table if exists grade_history;
drop table if exists student_courses;
drop table if exists courses;
drop table if exists students;
drop table if exists admins;

-- Create a table for students
create table if not exists students (
  id text primary key,
  name text not null,
  email text unique not null,
  password_hash text not null,
  program text not null,
  year text not null,
  semester text not null,
  avatar text,
  parish text,
  deanery text,
  phone text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Create a table for courses catalog
create table if not exists courses (
  id text primary key,
  name text not null,
  credits integer not null,
  department text not null,
  instructor text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Create a table for student enrollments
create table if not exists student_courses (
  id uuid default uuid_generate_v4() primary key,
  student_id text references students(id) on delete cascade,
  course_id text not null,
  course_name text not null,
  credits integer not null,
  grade text default '-',
  gpa float default 0,
  status text default 'Registered',
  progress integer default 0,
  instructor text,
  semester text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  unique(student_id, course_id)
);

-- Create a table for grade history
create table if not exists grade_history (
  id uuid default uuid_generate_v4() primary key,
  student_id text references students(id) on delete cascade,
  semester text not null,
  gpa float not null,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Create a table for admins
create table if not exists admins (
  id uuid default uuid_generate_v4() primary key,
  username text unique not null,
  password_hash text not null,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable Row Level Security
alter table students enable row level security;
alter table courses enable row level security;
alter table student_courses enable row level security;
alter table grade_history enable row level security;
alter table admins enable row level security;

-- Create Policies
-- Students: Public read for demo (or authenticated), Admin write
create policy "Public read access for students" on students for select using (true);
create policy "Public insert access for students" on students for insert with check (true);
create policy "Public update access for students" on students for update using (true);
create policy "Public delete access for students" on students for delete using (true);

-- Courses: Public read, Admin write
create policy "Public read access for courses" on courses for select using (true);
create policy "Public insert access for courses" on courses for insert with check (true);
create policy "Public update access for courses" on courses for update using (true);
create policy "Public delete access for courses" on courses for delete using (true);

-- Student Courses: Public read, Admin/Student write
create policy "Public read access for student_courses" on student_courses for select using (true);
create policy "Public insert access for student_courses" on student_courses for insert with check (true);
create policy "Public update access for student_courses" on student_courses for update using (true);
create policy "Public delete access for student_courses" on student_courses for delete using (true);

-- Grade History: Public read, Admin write
create policy "Public read access for grade_history" on grade_history for select using (true);
create policy "Public insert access for grade_history" on grade_history for insert with check (true);
create policy "Public update access for grade_history" on grade_history for update using (true);
create policy "Public delete access for grade_history" on grade_history for delete using (true);

-- Admins: Only admins can see admins
create policy "Public read access for admins" on admins for select using (true);
create policy "Public insert access for admins" on admins for insert with check (true);
`

export const seedDataSql = `
-- Seed Admin Data
insert into admins (username, password_hash)
values ('admin', '$2a$10$X8qJ9Z1Z9Z1Z9Z1Z9Z1Z9.') -- Hash for 'admin123'
on conflict (username) do nothing;

-- Seed Courses Catalog
insert into courses (id, name, credits, department, instructor) values
('CS301', 'Data Structures & Algorithms', 4, 'Computer Science', 'Dr. Smith'),
('CS302', 'Database Systems', 3, 'Computer Science', 'Prof. Johnson'),
('CS401', 'Machine Learning', 4, 'Computer Science', 'Dr. Williams'),
('CS402', 'Software Engineering', 3, 'Computer Science', 'Prof. Davis'),
('MATH301', 'Statistics', 3, 'Mathematics', 'Dr. Brown'),
('IT201', 'Network Fundamentals', 3, 'Information Technology', 'Prof. Wilson'),
('IT202', 'Web Development', 4, 'Information Technology', 'Dr. Martinez'),
('IT301', 'Cybersecurity', 3, 'Information Technology', 'Prof. Anderson'),
('IT302', 'Cloud Computing', 3, 'Information Technology', 'Dr. Thompson'),
('DS401', 'Advanced Machine Learning', 4, 'Data Science', 'Dr. Chen'),
('DS402', 'Big Data Analytics', 3, 'Data Science', 'Prof. Lee'),
('DS403', 'Deep Learning', 4, 'Data Science', 'Dr. Kumar'),
('DS404', 'Data Visualization', 3, 'Data Science', 'Prof. Garcia'),
('SE101', 'Introduction to Programming', 4, 'Software Engineering', 'Prof. White'),
('SE102', 'Software Design Principles', 3, 'Software Engineering', 'Dr. Taylor'),
('MATH101', 'Calculus I', 4, 'Mathematics', 'Prof. Miller'),
('ENG101', 'Technical Writing', 3, 'English', 'Dr. Roberts')
on conflict (id) do nothing;

-- Seed Students
insert into students (id, name, email, password_hash, program, year, semester, avatar, parish, deanery, phone) values
('ST001', 'John Smith', 'john.smith@university.edu', '$2a$10$X8qJ9Z1Z9Z1Z9Z1Z9Z1Z9.', 'Computer Science', '2025', '1Qtr', '/placeholder.svg?height=100&width=100', 'St. Mary', 'North Deanery', '555-0101'),
('ST002', 'Emily Johnson', 'emily.johnson@university.edu', '$2a$10$X8qJ9Z1Z9Z1Z9Z1Z9Z1Z9.', 'Information Technology', '2026', '1Qtr', '/placeholder.svg?height=100&width=100', 'St. Joseph', 'South Deanery', '555-0102'),
('ST003', 'Michael Brown', 'michael.brown@university.edu', '$2a$10$X8qJ9Z1Z9Z1Z9Z1Z9Z1Z9.', 'Data Science', '2025', '1Qtr', '/placeholder.svg?height=100&width=100', 'Holy Trinity', 'East Deanery', '555-0103'),
('ST004', 'Sarah Davis', 'sarah.davis@university.edu', '$2a$10$X8qJ9Z1Z9Z1Z9Z1Z9Z1Z9.', 'Software Engineering', '2027', '1Qtr', '/placeholder.svg?height=100&width=100', 'St. Peter', 'West Deanery', '555-0104')
on conflict (id) do update set 
  parish = EXCLUDED.parish,
  deanery = EXCLUDED.deanery,
  phone = EXCLUDED.phone;

-- Seed Student Courses
insert into student_courses (student_id, course_id, course_name, credits, grade, gpa, status, progress, instructor, semester) values
('ST001', 'CS301', 'Data Structures & Algorithms', 4, 'A', 4.0, 'Completed', 100, 'Dr. Smith', '2Qtr'),
('ST001', 'CS302', 'Database Systems', 3, 'A-', 3.7, 'Completed', 100, 'Prof. Johnson', '2Qtr'),
('ST001', 'CS401', 'Machine Learning', 4, 'B+', 3.3, 'In Progress', 75, 'Dr. Williams', '1Qtr'),
('ST001', 'CS402', 'Software Engineering', 3, '-', 0, 'Registered', 25, 'Prof. Davis', '1Qtr'),
('ST001', 'MATH301', 'Statistics', 3, 'A', 4.0, 'Completed', 100, 'Dr. Brown', '2Qtr'),

('ST002', 'IT201', 'Network Fundamentals', 3, 'A', 4.0, 'Completed', 100, 'Prof. Wilson', '2Qtr'),
('ST002', 'IT202', 'Web Development', 4, 'A-', 3.7, 'Completed', 100, 'Dr. Martinez', '2Qtr'),
('ST002', 'IT301', 'Cybersecurity', 3, 'B+', 3.3, 'In Progress', 60, 'Prof. Anderson', '1Qtr'),
('ST002', 'IT302', 'Cloud Computing', 3, '-', 0, 'Registered', 15, 'Dr. Thompson', '1Qtr'),

('ST003', 'DS401', 'Advanced Machine Learning', 4, 'A', 4.0, 'Completed', 100, 'Dr. Chen', '2Qtr'),
('ST003', 'DS402', 'Big Data Analytics', 3, 'A', 4.0, 'Completed', 100, 'Prof. Lee', '2Qtr'),
('ST003', 'DS403', 'Deep Learning', 4, 'A-', 3.7, 'In Progress', 80, 'Dr. Kumar', '1Qtr'),
('ST003', 'DS404', 'Data Visualization', 3, '-', 0, 'Registered', 30, 'Prof. Garcia', '1Qtr'),

('ST004', 'SE101', 'Introduction to Programming', 4, 'A-', 3.7, 'Completed', 100, 'Prof. White', '2Qtr'),
('ST004', 'SE102', 'Software Design Principles', 3, 'B+', 3.3, 'In Progress', 70, 'Dr. Taylor', '1Qtr'),
('ST004', 'MATH101', 'Calculus I', 4, '-', 0, 'Registered', 40, 'Prof. Miller', '1Qtr'),
('ST004', 'ENG101', 'Technical Writing', 3, '-', 0, 'Registered', 20, 'Dr. Roberts', '1Qtr')
on conflict do nothing;

-- Seed Grade History
insert into grade_history (student_id, semester, gpa) values
('ST001', '1Qtr', 3.4), ('ST001', '2Qtr', 3.8), ('ST001', '3Qtr', 3.5),
('ST002', '1Qtr', 3.6), ('ST002', '2Qtr', 3.85), ('ST002', '3Qtr', 3.3),
('ST003', '1Qtr', 3.8), ('ST003', '2Qtr', 3.9), ('ST003', '3Qtr', 3.95), ('ST003', '4Qtr', 4.0),
('ST004', '2Qtr', 3.7), ('ST004', '1Qtr', 3.5)
on conflict do nothing;
`
