-- Replace the overly permissive INSERT policy with a more restrictive one
-- that limits registrations to one per phone per event
DROP POLICY "Anyone can register for events" ON public.event_registrations;

CREATE POLICY "Rate limited event registration"
  ON public.event_registrations FOR INSERT
  WITH CHECK (
    NOT EXISTS (
      SELECT 1 FROM public.event_registrations er
      WHERE er.event_id = event_id AND er.phone = phone
    )
  );