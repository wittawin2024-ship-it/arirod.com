-- Create user_roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'editor')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create policy for users to read their own role
CREATE POLICY "Allow users to read their own role" ON public.user_roles
    FOR SELECT TO authenticated USING (auth.uid() = id);

-- Create trigger to automatically sync auth.users with public.user_roles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    role_to_assign TEXT;
    user_count INT;
BEGIN
    -- Check if this is the first user to determine if they should be admin
    SELECT COUNT(*) INTO user_count FROM public.user_roles;
    IF user_count = 0 THEN
        role_to_assign := 'admin';
    ELSE
        role_to_assign := 'editor';
    END IF;

    INSERT INTO public.user_roles (id, email, role)
    VALUES (new.id, new.email, role_to_assign)
    ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- Create articles table for blog
CREATE TABLE IF NOT EXISTS public.articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    category TEXT NOT NULL,
    content TEXT NOT NULL,
    image TEXT,
    read_time INT DEFAULT 5,
    date TIMESTAMPTZ DEFAULT NOW(),
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for articles
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

-- Create policy for public read on articles
CREATE POLICY "Allow public read access on articles" ON public.articles
    FOR SELECT USING (true);

-- Create policy for authenticated users to write (we'll check editor/admin in API layer)
CREATE POLICY "Allow admin/editor write access on articles" ON public.articles
    FOR ALL TO authenticated USING (true);
