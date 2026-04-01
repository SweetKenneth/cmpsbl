
-- Merge developer records: link the keyed record to the auth user and remove the orphan
-- Step 1: Move the active API key's developer record to point at the auth user
UPDATE public.access_developers
SET user_id = '6abb6b94-416b-4cb0-934d-2d64df8ac109'
WHERE id = '24bd4aaa-c3d1-45ec-af90-8e038b1cf580'
  AND user_id IS NULL;

-- Step 2: Re-parent any API keys from the orphan developer to the keyed one
UPDATE public.access_api_keys
SET developer_id = '24bd4aaa-c3d1-45ec-af90-8e038b1cf580'
WHERE developer_id = '4af6e18a-f55d-4b32-b964-5ac16dc29315';

-- Step 3: Re-parent any subscriptions from the orphan
UPDATE public.access_subscriptions
SET developer_id = '24bd4aaa-c3d1-45ec-af90-8e038b1cf580'
WHERE developer_id = '4af6e18a-f55d-4b32-b964-5ac16dc29315';

-- Step 4: Re-parent any usage records from the orphan
UPDATE public.access_usage
SET developer_id = '24bd4aaa-c3d1-45ec-af90-8e038b1cf580'
WHERE developer_id = '4af6e18a-f55d-4b32-b964-5ac16dc29315';

-- Step 5: Delete the orphan developer record
DELETE FROM public.access_developers
WHERE id = '4af6e18a-f55d-4b32-b964-5ac16dc29315';
