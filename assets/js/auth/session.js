const {
    data: { session }
} = await window.supabaseClient.auth.getSession();

if (session) {
    document.getElementById("user-email").textContent =
        session.user.email;
}