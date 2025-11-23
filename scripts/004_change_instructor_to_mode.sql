-- Rename instructor column to mode in courses and student_courses tables
DO $$
BEGIN
    IF EXISTS(SELECT * FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'instructor') THEN
        ALTER TABLE courses RENAME COLUMN instructor TO mode;
    END IF;

    IF EXISTS(SELECT * FROM information_schema.columns WHERE table_name = 'student_courses' AND column_name = 'instructor') THEN
        ALTER TABLE student_courses RENAME COLUMN instructor TO mode;
    END IF;
END $$;

-- Update existing values to valid 'Mode of Study' options
-- We default existing records to 'Physical' as a safe fallback
UPDATE courses SET mode = 'Physical' WHERE mode NOT IN ('Online', 'Self study', 'Physical');
UPDATE student_courses SET mode = 'Physical' WHERE mode NOT IN ('Online', 'Self study', 'Physical');
