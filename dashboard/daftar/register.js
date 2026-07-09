import { createClient } from "https://esm.sh/@supabase/supabase-js";

const supabase = createClient(
    window.SUPABASE_URL,
    window.SUPABASE_ANON_KEY
);

const params = new URLSearchParams(window.location.search);

const programSlug = params.get("program");

let selectedProgram = null;

async function init() {

    const programsRes = await fetch("/content/data/programs.json");

    const programs = await programsRes.json();

    selectedProgram = programs.find(
        p => p.program_slug === programSlug
    );

    if (!selectedProgram) {

        alert("Program tidak ditemukan");

        return;
    }

    document.getElementById("programTitle").value =
        selectedProgram.title;

    loadBatches();
}

async function loadBatches() {

    const { data, error } = await supabase
        .from("program_batches")
        .select("*")
        .eq("program_slug", programSlug)
        .eq("status", "open");

    if (error) {

        console.error(error);

        return;
    }

    const select = document.getElementById("batchSelect");

    select.innerHTML = "";

    data.forEach(batch => {

        const option = document.createElement("option");

        option.value = batch.id;

        option.textContent = batch.batch_name;

        select.appendChild(option);

    });

}

document
    .getElementById("registrationForm")
    .addEventListener("submit", async (e) => {

        e.preventDefault();

        const payload = {

            batch_id:
                document.getElementById("batchSelect").value,

            program_slug:
                programSlug,

            full_name:
                document.getElementById("fullName").value,

            email:
                document.getElementById("email").value,

            phone:
                document.getElementById("phone").value,

            age:
                Number(document.getElementById("age").value) || null,

            domicile:
                document.getElementById("domicile").value,

            profession:
                document.getElementById("profession").value,

            has_hafalan:
                document.getElementById("hasHafalan").value === "true",

            hafalan_juz:
                Number(document.getElementById("hafalanJuz").value) || null,

            target_juz:
                document.getElementById("targetJuz").value,

            source_info:
                document.getElementById("sourceInfo").value,

            motivation:
                document.getElementById("motivation").value,

            is_returning_student:
                document.getElementById("returningStudent").value === "true",

            status: "pending"
        };

        const { error } = await supabase
            .from("registrations")
            .insert([payload]);

        if (error) {

            console.error(error);

            alert(error.message);

            return;
        }

        document
            .getElementById("registrationForm")
            .reset();

        document
            .getElementById("successBox")
            .classList.remove("hidden");

    });

init();