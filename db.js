// db.js (Supabase version)
const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = "https://lnwamjxbutjbmorlffks.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_57CoknqLyXdg7PHeOtdQdw_S3rf25q8";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

module.exports = supabase;

