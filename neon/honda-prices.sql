-- Honda new-outboard pricing (admin-managed, public display)

CREATE TABLE IF NOT EXISTS public.honda_models (
  sku text PRIMARY KEY,
  name text NOT NULL,
  category text NOT NULL DEFAULT 'portable'
    CHECK (category IN ('portable', 'midrange', 'inline4', 'highpower', '300plus')),
  hp numeric(6,1),
  sort_order integer NOT NULL DEFAULT 0,
  price numeric(10,2),
  show_price boolean NOT NULL DEFAULT false,
  notes text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS honda_models_sort_idx
  ON public.honda_models (sort_order, sku);

DROP TRIGGER IF EXISTS honda_models_updated_at ON public.honda_models;
CREATE TRIGGER honda_models_updated_at
  BEFORE UPDATE ON public.honda_models
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.honda_models (sku, name, category, hp, sort_order, price, show_price) VALUES
  ('bf23', 'Honda BF2.3', 'portable', 2.3, 10, NULL, false),
  ('bf5', 'Honda BF5', 'portable', 5, 20, NULL, false),
  ('bf8', 'Honda BF8', 'portable', 8, 30, NULL, false),
  ('bf10', 'Honda BF10', 'portable', 10, 40, NULL, false),
  ('bf15', 'Honda BF15', 'portable', 15, 50, NULL, false),
  ('bf20', 'Honda BF20', 'portable', 20, 60, NULL, false),
  ('bf25', 'Honda BF25', 'midrange', 25, 70, NULL, false),
  ('bf30', 'Honda BF30', 'midrange', 30, 80, NULL, false),
  ('bf40', 'Honda BF40', 'midrange', 40, 90, 11695, true),
  ('bf50', 'Honda BF50', 'midrange', 50, 100, 12795, true),
  ('bf60', 'Honda BF60', 'midrange', 60, 110, 13895, true),
  ('bf75', 'Honda BF75', 'midrange', 75, 120, NULL, false),
  ('bf80', 'Honda BF80', 'midrange', 80, 130, 14995, true),
  ('bf90', 'Honda BF90', 'midrange', 90, 140, NULL, false),
  ('bf100', 'Honda BF100', 'midrange', 100, 150, NULL, false),
  ('bf115', 'Honda BF115', 'inline4', 115, 160, NULL, false),
  ('bf135', 'Honda BF135', 'inline4', 135, 170, NULL, false),
  ('bf150', 'Honda BF150', 'inline4', 150, 180, NULL, false),
  ('bf175', 'Honda BF175', 'highpower', 175, 190, NULL, false),
  ('bf200', 'Honda BF200', 'highpower', 200, 200, NULL, false),
  ('bf200ist', 'Honda BF200iST', 'highpower', 200, 210, NULL, false),
  ('bf225', 'Honda BF225', 'highpower', 225, 220, NULL, false),
  ('bf225ist', 'Honda BF225iST', 'highpower', 225, 230, NULL, false),
  ('bf250', 'Honda BF250', 'highpower', 250, 240, NULL, false),
  ('m300', 'Honda M300', '300plus', 300, 250, NULL, false),
  ('bf350', 'Honda BF350', '300plus', 350, 260, NULL, false)
ON CONFLICT (sku) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  hp = EXCLUDED.hp,
  sort_order = EXCLUDED.sort_order,
  price = COALESCE(honda_models.price, EXCLUDED.price),
  show_price = CASE
    WHEN honda_models.price IS NOT NULL THEN honda_models.show_price
    ELSE EXCLUDED.show_price
  END;
