(async () => {

    const {
        data: { user }
    } = await window.supabaseClient.auth.getUser();

    if (!user) return;

    const { data } =
        await window.supabaseClient
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();

    document.getElementById("user-name").textContent =
        data?.full_name || user.email;

    document.getElementById("user-role").textContent =
        data?.role || "student";

})();