
-- Fix Function Search Path Mutable: set search_path on 2 functions

ALTER FUNCTION public.brain_bulk_demote_hot_to_warm(integer)
  SET search_path = public;

ALTER FUNCTION public.brain_bulk_demote_warm_to_cold(integer)
  SET search_path = public;
