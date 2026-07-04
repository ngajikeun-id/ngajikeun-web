(async () => {

    const {
        data: { user }
    } = await window.supabaseClient.auth.getUser();

    if (!user) return;

    document.getElementById("user-email").textContent =
        user.email;

})();