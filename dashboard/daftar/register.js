import { FIELD_DEFINITIONS } from "./field-definitions.js";

const supabase =
    window.supabaseClient;

const params = new URLSearchParams(window.location.search);
const programSlug = params.get("program");

let selectedProgram = null;

async function init() {
    if (!supabase) {
        alert("Koneksi Supabase belum tersedia");
        return;
    }

    if (!programSlug) {
        alert("Program belum dipilih");
        return;
    }

    const siteRes =
        await fetch("/content/data/site-data.json");

    const siteData =
        await siteRes.json();

    const programs = siteData.programs || [];

    selectedProgram = programs.find(
        p => p.program_slug === programSlug
    );

    if (!selectedProgram) {
        alert("Program tidak ditemukan");
        return;
    }

    document.getElementById("programTitle").value =
        selectedProgram.title;

    await renderDynamicFields();
}

async function renderDynamicFields() {

    const container =
        document.getElementById("dynamicFields");

    container.innerHTML = "";

    const fields =
        normalizeRegistrationFields(selectedProgram.registration_fields);

    for (const fieldKey of fields) {

        const field =
            FIELD_DEFINITIONS[fieldKey];

        if (!field) continue;

        container.insertAdjacentHTML(
            "beforeend",
            renderField(fieldKey, field)
        );

        if (fieldKey === "batch") {

            const element =
                document.getElementById(fieldKey);

            await loadBatches(element);
        }
    }
}

function normalizeRegistrationFields(fields) {
    const configuredFields =
        Array.isArray(fields) ? fields : [];

    return [
        "batch",
        ...configuredFields.filter(fieldKey => fieldKey !== "batch")
    ];
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
            (field.options || []).map(opt => `
                <option value="${opt.value}">
                    ${opt.label}
                </option>
            `).join("") || `<option value="">Memuat pilihan...</option>`;

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
    if (!select) return;

    select.disabled = true;
    select.innerHTML =
        `<option value="">Memuat batch...</option>`;

    const { data, error } = await supabase
        .from("program_batches")
        .select("*")
        .eq("program_slug", programSlug)
        .eq("status", "open");

    if (error) {
        console.error(error);
        select.innerHTML =
            `<option value="">Batch gagal dimuat</option>`;
        return;
    }

    select.innerHTML = "";

    if (!data?.length) {
        select.innerHTML =
            `<option value="">Belum ada batch terbuka</option>`;
        return;
    }

    data.forEach(batch => {

        const option =
            document.createElement("option");

        option.value = batch.id;
        option.textContent = batch.batch_name;

        select.appendChild(option);
    });

    select.disabled = false;
}

document
    .getElementById("registrationForm")
    .addEventListener("submit", async (e) => {

        e.preventDefault();

        const batchSelect =
            document.getElementById("batch");

        if (!batchSelect?.value) {
            alert("Silakan pilih batch terlebih dahulu");
            return;
        }

        const payload = {
            batch_id:
                batchSelect.value,

            program_slug:
                programSlug,

            status: "pending"
        };

        const fields =
            normalizeRegistrationFields(selectedProgram.registration_fields);

        fields.forEach(fieldKey => {
            if (fieldKey === "batch") return;

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
