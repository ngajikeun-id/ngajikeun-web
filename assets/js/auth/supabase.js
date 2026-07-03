const SUPABASE_URL =
    "https://ooxubsnlhfbxnvmuzxmp.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_yiebwqFUqMSt4xrvBeS_vQ_YR5eHNhg";

const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

window.supabaseClient = supabaseClient;