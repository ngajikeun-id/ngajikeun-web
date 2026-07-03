document
    .getElementById("loginBtn")
    .addEventListener("click", async () => {

        const email =
            document.getElementById("email").value;

        const { error } =
            await window.supabaseClient.auth.signInWithOtp({
                email,
                options: {
                    emailRedirectTo: `${window.location.origin}/dashboard/`
                }
            });

        if (error) {
            alert(error.message);
            return;
        }

        alert("Magic Link terkirim.");
    });