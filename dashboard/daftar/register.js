import { FIELD_DEFINITIONS } from "./field-definitions.js";

const supabase =
    window.supabaseClient;

const params = new URLSearchParams(window.location.search);
const programSlug = params.get("program");

let selectedProgram = null;

async function init() {

    const siteRes =
        await fetch("/content/data/site-data.json");

    const siteData =
        await siteRes.json();

    console.log(siteData);

    const programs = siteData.programs || [];

    selectedProgram = programs.find(
        p => p.program_slug === programSlug
    );

    console.log("SELECTED PROGRAM", selectedProgram);
    console.log(
        "REGISTRATION FIELDS",
        selectedProgram?.registration_fields
    );

    if (!selectedProgram) {
        alert("Program tidak ditemukan");
        return;
    }

    document.getElementById("programTitle").value =
        selectedProgram.title;

    await renderDynamicFields();
    await loadBatches();
}

async function renderDynamicFields() {

    const container =
        document.getElementById("dynamicFields");

    container.innerHTML = "";

    const fields =
        selectedProgram.registration_fields || [];

    for (const fieldKey of fields) {

        const field =
            FIELD_DEFINITIONS[fieldKey];

        if (!field) continue;

        container.insertAdjacentHTML(
            "beforeend",
            renderField(fieldKey, field)
        );

        if (field.type === "select" && field.loader) {

            const element =
                document.getElementById(fieldKey);

            await field.loader(element);
        }
    }
}

function renderField(name, field) {

    const required =
        field.required ? "required" : "";

    if (field.type === "textarea") {

        return `
            <div class="form-group">
                <label>${field.label}</label>
                <textarea
                    id="${name}"
                    name="${name}"
                    ${required}></textarea>
            </div>
        `;
    }

    if (field.type === "select") {

        const options =
            field.options.map(opt => `
                <option value="${opt.value}">
                    ${opt.label}
                </option>
            `).join("");

        return `
            <div class="form-group">
                <label>${field.label}</label>

                <select
                    id="${name}"
                    name="${name}"
                    ${required}>
                    ${options}
                </select>
            </div>
        `;
    }

    return `
        <div class="form-group">
            <label>${field.label}</label>

            <input
                type="${field.type}"
                id="${name}"
                name="${name}"
                ${required}>
        </div>
    `;
}

async function loadBatches(select) {

    const { data, error } = await supabase
        .from("program_batches")
        .select("*")
        .eq("program_slug", programSlug)
        .eq("status", "open");

    if (error) {
        console.error(error);
        return;
    }

    select.innerHTML = "";

    data.forEach(batch => {

        const option =
            document.createElement("option");

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

            status: "pending"
        };

        const fields =
            selectedProgram.registration_fields || [];

        fields.forEach(fieldKey => {

            const element =
                document.getElementById(fieldKey);

            if (!element) return;

            let value = element.value;

            if (
                fieldKey === "age" ||
                fieldKey === "hafalan_juz"
            ) {
                value = value
                    ? Number(value)
                    : null;
            }

            if (
                fieldKey === "has_hafalan" ||
                fieldKey === "is_returning_student"
            ) {
                value = value === "true";
            }

            payload[fieldKey] = value;
        });

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