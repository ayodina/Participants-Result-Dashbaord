-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Create a table for students
create table if not exists students (
  id text primary key,
  name text not null,
  email text unique not null,
  password text not null,
  program text not null,
  year text not null,
  semester text not null,
  avatar_url text,
  courses jsonb default '[]'::jsonb,
  grade_history jsonb default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Create a table for admins
create table if not exists admins (
  id uuid default uuid_generate_v4() primary key,
  username text unique not null,
  password text not null, -- In a real app, this should be hashed!
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Create storage bucket for avatars
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Set up RLS policies for storage
create policy "Public Access"
on storage.objects for select
using ( bucket_id = 'avatars' );

create policy "Authenticated users can upload"
on storage.objects for insert
with check ( bucket_id = 'avatars' );

create policy "Users can update their own avatars"
on storage.objects for update
using ( bucket_id = 'avatars' );

-- Seed Admin Data
insert into admins (username, password)
values ('admin', 'admin123')
on conflict (username) do nothing;

-- Seed Student Data (from lib/student-data.ts)
insert into students (id, name, email, password, program, year, semester, avatar_url, courses, grade_history)
values
  (
    'ST001',
    'John Smith',
    'john.smith@university.edu',
    'john123',
    'Computer Science',
    '2025',
    '1Qtr',
    '/placeholder.svg?height=100&width=100',
    '[
      {
        "id": "CS301",
        "name": "Data Structures & Algorithms",
        "credits": 4,
        "grade": "A",
        "gpa": 4.0,
        "status": "Completed",
        "progress": 100,
        "instructor": "Dr. Smith",
        "semester": "2Qtr"
      },
      {
        "id": "CS302",
        "name": "Database Systems",
        "credits": 3,
        "grade": "A-",
        "gpa": 3.7,
        "status": "Completed",
        "progress": 100,
        "instructor": "Prof. Johnson",
        "semester": "2Qtr"
      },
      {
        "id": "CS401",
        "name": "Machine Learning",
        "credits": 4,
        "grade": "B+",
        "gpa": 3.3,
        "status": "In Progress",
        "progress": 75,
        "instructor": "Dr. Williams",
        "semester": "1Qtr"
      },
      {
        "id": "CS402",
        "name": "Software Engineering",
        "credits": 3,
        "grade": "-",
        "gpa": 0,
        "status": "Registered",
        "progress": 25,
        "instructor": "Prof. Davis",
        "semester": "1Qtr"
      },
      {
        "id": "MATH301",
        "name": "Statistics",
        "credits": 3,
        "grade": "A",
        "gpa": 4.0,
        "status": "Completed",
        "progress": 100,
        "instructor": "Dr. Brown",
        "semester": "2Qtr"
      }
    ]'::jsonb,
    '[{"semester": "1Qtr", "gpa": 3.4}, {"semester": "2Qtr", "gpa": 3.8}, {"semester": "3Qtr", "gpa": 3.5}]'::jsonb
  ),
  (
    'ST002',
    'Emily Johnson',
    'emily.johnson@university.edu',
    'emily456',
    'Information Technology',
    '2026',
    '1Qtr',
    '/placeholder.svg?height=100&width=100',
    '[
      {
        "id": "IT201",
        "name": "Network Fundamentals",
        "credits": 3,
        "grade": "A",
        "gpa": 4.0,
        "status": "Completed",
        "progress": 100,
        "instructor": "Prof. Wilson",
        "semester": "2Qtr"
      },
      {
        "id": "IT202",
        "name": "Web Development",
        "credits": 4,
        "grade": "A-",
        "gpa": 3.7,
        "status": "Completed",
        "progress": 100,
        "instructor": "Dr. Martinez",
        "semester": "2Qtr"
      },
      {
        "id": "IT301",
        "name": "Cybersecurity",
        "credits": 3,
        "grade": "B+",
        "gpa": 3.3,
        "status": "In Progress",
        "progress": 60,
        "instructor": "Prof. Anderson",
        "semester": "1Qtr"
      },
      {
        "id": "IT302",
        "name": "Cloud Computing",
        "credits": 3,
        "grade": "-",
        "gpa": 0,
        "status": "Registered",
        "progress": 15,
        "instructor": "Dr. Thompson",
        "semester": "1Qtr"
      }
    ]'::jsonb,
    '[{"semester": "1Qtr", "gpa": 3.6}, {"semester": "2Qtr", "gpa": 3.85}, {"semester": "3Qtr", "gpa": 3.3}]'::jsonb
  ),
  (
    'ST003',
    'Michael Brown',
    'michael.brown@university.edu',
    'mike789',
    'Data Science',
    '2025',
    '1Qtr',
    '/placeholder.svg?height=100&width=100',
    '[
      {
        "id": "DS401",
        "name": "Advanced Machine Learning",
        "credits": 4,
        "grade": "A",
        "gpa": 4.0,
        "status": "Completed",
        "progress": 100,
        "instructor": "Dr. Chen",
        "semester": "2Qtr"
      },
      {
        "id": "DS402",
        "name": "Big Data Analytics",
        "credits": 3,
        "grade": "A",
        "gpa": 4.0,
        "status": "Completed",
        "progress": 100,
        "instructor": "Prof. Lee",
        "semester": "2Qtr"
      },
      {
        "id": "DS403",
        "name": "Deep Learning",
        "credits": 4,
        "grade": "A-",
        "gpa": 3.7,
        "status": "In Progress",
        "progress": 80,
        "instructor": "Dr. Kumar",
        "semester": "1Qtr"
      },
      {
        "id": "DS404",
        "name": "Data Visualization",
        "credits": 3,
        "grade": "-",
        "gpa": 0,
        "status": "Registered",
        "progress": 30,
        "instructor": "Prof. Garcia",
        "semester": "1Qtr"
      }
    ]'::jsonb,
    '[{"semester": "1Qtr", "gpa": 3.8}, {"semester": "2Qtr", "gpa": 3.9}, {"semester": "3Qtr", "gpa": 3.95}, {"semester": "4Qtr", "gpa": 4.0}]'::jsonb
  ),
  (
    'ST004',
    'Sarah Davis',
    'sarah.davis@university.edu',
    'sarah321',
    'Software Engineering',
    '2027',
    '1Qtr',
    '/placeholder.svg?height=100&width=100',
    '[
      {
        "id": "SE101",
        "name": "Introduction to Programming",
        "credits": 4,
        "grade": "A-",
        "gpa": 3.7,
        "status": "Completed",
        "progress": 100,
        "instructor": "Prof. White",
        "semester": "2Qtr"
      },
      {
        "id": "SE102",
        "name": "Software Design Principles",
        "credits": 3,
        "grade": "B+",
        "gpa": 3.3,
        "status": "In Progress",
        "progress": 70,
        "instructor": "Dr. Taylor",
        "semester": "1Qtr"
      },
      {
        "id": "MATH101",
        "name": "Calculus I",
        "credits": 4,
        "grade": "-",
        "gpa": 0,
        "status": "Registered",
        "progress": 40,
        "instructor": "Prof. Miller",
        "semester": "1Qtr"
      },
      {
        "id": "ENG101",
        "name": "Technical Writing",
        "credits": 3,
        "grade": "-",
        "gpa": 0,
        "status": "Registered",
        "progress": 20,
        "instructor": "Dr. Roberts",
        "semester": "1Qtr"
      }
    ]'::jsonb,
    '[{"semester": "2Qtr", "gpa": 3.7}, {"semester": "1Qtr", "gpa": 3.5}]'::jsonb
  )
on conflict (id) do nothing;
