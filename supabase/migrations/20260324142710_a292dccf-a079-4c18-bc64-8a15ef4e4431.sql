
UPDATE access_api_keys SET is_active = false WHERE id = 'f489b012-953e-46ed-a86b-87805e9efa19';

INSERT INTO access_api_keys (developer_id, key_hash, key_prefix, name, scopes, is_active)
VALUES (
  '24bd4aaa-c3d1-45ec-af90-8e038b1cf580',
  'fcb05f89f6626508095f42c4e3f3950320960fea656872eca3ea1872dd47f684',
  'cmpsbl_b6i7',
  'Governor CLI Key',
  ARRAY['memory:read','memory:write','playground','governor','admin','decode','encode','nexus','cortex','forge','vision','lingua','oracle','ascension','evolution','shadow','defense','immunity','governance','atlas','harvest','economy'],
  true
);
