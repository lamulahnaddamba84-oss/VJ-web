
-- Live streams table
CREATE TABLE public.live_streams (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  vj text NOT NULL,
  stream_url text NOT NULL,
  thumbnail_url text,
  is_live boolean NOT NULL DEFAULT false,
  scheduled_at timestamptz,
  viewers int NOT NULL DEFAULT 0,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.live_streams TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.live_streams TO authenticated;
GRANT ALL ON public.live_streams TO service_role;
ALTER TABLE public.live_streams ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view live streams" ON public.live_streams FOR SELECT USING (true);
CREATE POLICY "Admins can manage live streams" ON public.live_streams FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Shorts table
CREATE TABLE public.shorts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  vj text,
  video_url text NOT NULL,
  thumbnail_url text,
  duration int,
  views int NOT NULL DEFAULT 0,
  likes int NOT NULL DEFAULT 0,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.shorts TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.shorts TO authenticated;
GRANT ALL ON public.shorts TO service_role;
ALTER TABLE public.shorts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view shorts" ON public.shorts FOR SELECT USING (true);
CREATE POLICY "Admins can manage shorts" ON public.shorts FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$
LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_live_streams_updated_at BEFORE UPDATE ON public.live_streams
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_shorts_updated_at BEFORE UPDATE ON public.shorts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
