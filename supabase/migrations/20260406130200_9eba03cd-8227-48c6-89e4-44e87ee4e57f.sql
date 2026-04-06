
-- Reclassify primary "discovered" into proper showroom/junkyard/registry tiers
UPDATE public.discoveries SET status = 'registry', is_crown_jewel = true WHERE vertical = 'primary' AND status = 'discovered' AND cjpi >= 95;
UPDATE public.discoveries SET status = 'showroom' WHERE vertical = 'primary' AND status = 'discovered' AND cjpi >= 68 AND cjpi < 95;
UPDATE public.discoveries SET status = 'junkyard' WHERE vertical = 'primary' AND status = 'discovered' AND cjpi < 68;
