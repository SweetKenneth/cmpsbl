-- Fix dream_eater_state check constraint to include all cognitive phase moods
ALTER TABLE public.dream_eater_state DROP CONSTRAINT dream_eater_state_current_mood_check;

ALTER TABLE public.dream_eater_state ADD CONSTRAINT dream_eater_state_current_mood_check 
  CHECK (current_mood = ANY (ARRAY[
    'peaceful'::text, 
    'neutral'::text, 
    'agitated'::text, 
    'nightmare'::text, 
    'dreaming'::text,
    'synthesizing'::text,
    'reflecting'::text,
    'learning'::text,
    'integrating'::text,
    'mutating'::text,
    'digesting'::text
  ]));