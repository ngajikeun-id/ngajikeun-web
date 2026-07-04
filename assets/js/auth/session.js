(async () => {

    const { data: { user } } =
        await window.supabaseClient.auth.getUser();

    const { data } =
        await window.supabaseClient
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();

    document.getElementById("user-role").textContent =
        data.role;

})();