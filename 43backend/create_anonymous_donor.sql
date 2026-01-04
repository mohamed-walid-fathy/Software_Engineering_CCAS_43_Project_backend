-- Create an anonymous donor placeholder for anonymous donations
-- This is needed because the Donation table has donor_id as NOT NULL

INSERT INTO public.donor (donor_id, name, email, phone, password)
VALUES (1, 'Anonymous', 'anonymous@system.internal', NULL, NULL)
ON CONFLICT (donor_id) DO NOTHING;

-- Note: If donor_id = 1 already exists, you can use a different ID
-- Just make sure to update the backend code to match
