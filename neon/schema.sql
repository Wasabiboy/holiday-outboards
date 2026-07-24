-- Holiday Outboards — Neon schema for second-hand listings
-- Applied to project holidayoutboards (orange-hall-83151740)

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.second_hand_outboards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  make text NOT NULL,
  model text NOT NULL DEFAULT '',
  hp numeric(6,1),
  year integer,
  hours integer,
  shaft text,
  price numeric(10,2),
  condition text,
  description text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'available'
    CHECK (status IN ('available', 'sold')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS second_hand_outboards_status_idx
  ON public.second_hand_outboards (status);

CREATE INDEX IF NOT EXISTS second_hand_outboards_created_idx
  ON public.second_hand_outboards (created_at DESC);

CREATE TABLE IF NOT EXISTS public.listing_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL REFERENCES public.second_hand_outboards(id) ON DELETE CASCADE,
  content_type text NOT NULL DEFAULT 'image/jpeg',
  data bytea NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS listing_images_listing_idx
  ON public.listing_images (listing_id, sort_order);

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS second_hand_outboards_updated_at ON public.second_hand_outboards;
CREATE TRIGGER second_hand_outboards_updated_at
  BEFORE UPDATE ON public.second_hand_outboards
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
