(async () => {

    const {
        data: { user }
    } = await window.supabaseClient.auth.getUser();

    if (!user) return;

    const emailEl =
        document.getElementById("user-email");

    if (emailEl) {
        emailEl.textContent = user.email || "";
    }

    const { data } =
        await window.supabaseClient
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();

    const nameEl =
        document.getElementById("user-name");

    if (nameEl) {
        nameEl.textContent =
            data?.full_name || user.email;
    }

    const roleEl =
        document.getElementById("user-role");

    if (roleEl) {
        roleEl.textContent =
            data?.role || "student";
    }

})();
