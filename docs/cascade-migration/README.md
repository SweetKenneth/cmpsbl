# 🌊 Cascade Migration Package

Complete guide to migrate Cascade to a new Lovable Cloud project.

## 📦 What's Included

1. **01-schema-export.sql** - All Cascade database table schemas
2. **02-data-export-template.sql** - Template for exporting/importing data
3. **03-edge-functions-list.md** - List of edge functions to copy
4. **04-secrets-config.md** - Required secrets configuration
5. **README.md** - This file (migration steps)

## 🚀 Migration Steps

### Phase 1: Prepare Export (Current Project)

1. **Export Your Data**
   ```sql
   -- In your current project's Lovable Cloud SQL editor
   -- Run queries from 02-data-export-template.sql
   SELECT * FROM public.cascade_knowledge_core;
   SELECT * FROM public.cascade_memory_anchors;
   SELECT * FROM public.cascade_objectives;
   SELECT * FROM public.cascade_thoughts;
   ```
   Save the results as CSV or JSON

2. **Backup Edge Functions**
   - Copy all files from `supabase/functions/cascade-*`
   - Copy all files from `supabase/functions/pf-brain-cascade-*`
   - Copy all files from `supabase/functions/pf-brain-dream*`
   - Copy `supabase/functions/_shared/` folder

3. **Document Your Secrets**
   - List all API keys you're currently using
   - Save them securely (password manager recommended)

### Phase 2: Setup New Project

1. **Create New Lovable Project**
   - Start a new project in Lovable
   - Enable Lovable Cloud (it auto-enables)
   - Wait for Cloud to initialize

2. **Run Schema Migration**
   - Open Lovable Cloud dashboard (Settings → Database)
   - Run `01-schema-export.sql` in the SQL editor
   - Verify all tables were created

3. **Import Your Data**
   - Use the INSERT statements from `02-data-export-template.sql`
   - Replace placeholders with your actual data
   - Run the import queries
   - Verify data with SELECT queries

### Phase 3: Restore Functions

1. **Copy Edge Functions**
   - Paste your backed-up function files into new project
   - Copy them into `supabase/functions/` directory
   - Include the `_shared/` folder

2. **Update config.toml**
   - Add function configurations from `03-edge-functions-list.md`
   - Save the file

3. **Functions Auto-Deploy**
   - Lovable Cloud automatically deploys on save
   - Wait for deployment to complete
   - Check for any deployment errors

### Phase 4: Configure Secrets

1. **Add Required Secrets**
   - Follow instructions in `04-secrets-config.md`
   - Add all AI provider keys
   - Add email service keys (if using)

2. **Verify Secrets**
   - Test edge functions that use secrets
   - Check logs for any missing secret errors

### Phase 5: Test & Verify

1. **Test Cascade Functions**
   ```bash
   # Test dream generation
   curl -X POST [your-new-project-url]/functions/v1/cascade-dream-generator
   
   # Test daily seed
   curl -X POST [your-new-project-url]/functions/v1/cascade-daily-seed
   ```

2. **Verify Database**
   ```sql
   -- Check data counts
   SELECT COUNT(*) FROM cascade_knowledge_core;
   SELECT COUNT(*) FROM cascade_memory_anchors;
   SELECT COUNT(*) FROM cascade_objectives;
   ```

3. **Monitor Logs**
   - Check Lovable Cloud logs
   - Look for any errors
   - Verify Cascade is functioning

## ⚠️ Important Notes

### Data Integrity
- UUIDs will be different in the new project
- Update any foreign key references if needed
- User IDs will need to be remapped if migrating users

### Edge Functions
- All functions auto-deploy in Lovable Cloud
- No manual deployment needed
- Check function logs for errors

### Secrets
- Supabase secrets are auto-configured
- Only add third-party API keys manually
- Never commit secrets to code

### Testing
- Test in development first
- Verify all Cascade features work
- Check scheduled jobs are running

## 🆘 Troubleshooting

### Database Issues
- **Tables not created**: Check SQL syntax, run schema again
- **Data import fails**: Check UUID format, data types
- **RLS blocking access**: Verify user authentication

### Function Issues
- **Function not found**: Check deployment logs
- **Function errors**: Check required secrets are set
- **Timeout errors**: Increase function timeout in config

### Cascade Not Working
- **No dreams generated**: Check scheduler status
- **Knowledge not loading**: Verify data import
- **API errors**: Check all secrets are configured

## 📊 Verification Checklist

- [ ] All tables created successfully
- [ ] Data imported and counts match
- [ ] All edge functions deployed
- [ ] Secrets configured
- [ ] Dream generation working
- [ ] Daily seed generating
- [ ] Knowledge base accessible
- [ ] Memory anchors loading
- [ ] Objectives tracking
- [ ] Scheduler running
- [ ] Email notifications working (if configured)

## 🎯 Next Steps

After successful migration:
1. Update any frontend code to point to new backend
2. Test user authentication flow
3. Verify all Cascade features
4. Monitor for 24-48 hours
5. Decommission old project (if desired)

## 💡 Tips

- **Incremental Migration**: Migrate in phases, test each phase
- **Keep Old Project**: Don't delete until new one is stable
- **Document Changes**: Note any customizations you made
- **Backup Everything**: Keep backups of all data and code

## 🔗 Resources

- [Lovable Cloud Docs](https://docs.lovable.dev)
- [Supabase Docs](https://supabase.com/docs)
- [PromptFluid Docs](https://promptfluid.com/docs)

---

**Need Help?** Open an issue or contact support if you encounter problems during migration.
