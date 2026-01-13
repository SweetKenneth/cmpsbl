# Deleted Functions - Remove from config.toml

These functions were deleted but are still in config.toml. Remove these sections:

```toml
# REMOVE THESE (functions already deleted):
[functions.pf-brain-act]  # Line 107-108
[functions.pf-brain-compress]  # Line 137-138
[functions.pf-brain-context-check]  # Line 140-141
[functions.pf-brain-correlate]  # Line 146-147
[functions.pf-brain-dtq]  # Line 170-171
[functions.pf-brain-echo]  # Line 173-174
[functions.pf-brain-feedback-ingest]  # Line 188-189
[functions.pf-brain-proxy]  # Line 257-258
[functions.pf-brain-queue-feeder]  # Line 260-261
[functions.pf-brain-reboot]  # Line 263-264
```

After removing these 10 function configs, you'll have 10 slots freed up for:
- pf-brain-dream-unified
- pf-brain-reflect  
- future migrations

The config.toml has these deleted functions still configured - they need manual removal since they span multiple non-contiguous sections.
