-- Honda pricing + spec details (July 2025 RRP sheet — representative highlighted configs)

ALTER TABLE public.honda_models
  ADD COLUMN IF NOT EXISTS model_code text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS shaft text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS displacement text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS prop text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS fuel_tank text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS dry_weight text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS amp_charge text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS manual_start boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS electric_start boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS power_tilt boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS trim_tilt boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS tiller boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS remote boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS vtec boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS drive_by_wire boolean NOT NULL DEFAULT false;
