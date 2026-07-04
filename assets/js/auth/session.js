(async () => {

    const {
        data: { user }
    } = await window.supabaseClient.auth.getUser();

    if (!user) return;

    document.getElementById("user-email").textContent =
        user.email;

    const { data, error } =
        await window.supabaseClient
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();

    console.log("PROFILE:", data);
    console.log("ERROR:", error);

    if (data && document.getElementById("user-role")) {
        document.getElementById("user-role").textContent =
            data.role;
    }

})();