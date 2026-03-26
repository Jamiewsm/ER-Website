// ER-Website: Supabase client (depends on config.js and Supabase CDN)
(function () {
  var config = window.SUPABASE_CONFIG;
  if (!config || !config.url || !config.anonKey) {
    window.supabaseClient = null;
    return;
  }
  if (typeof window.supabase !== "undefined" && typeof window.supabase.createClient === "function") {
    window.supabaseClient = window.supabase.createClient(config.url, config.anonKey);
  } else {
    window.supabaseClient = null;
  }
})();
