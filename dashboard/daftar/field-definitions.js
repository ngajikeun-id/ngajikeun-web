export const FIELD_DEFINITIONS = {
    full_name: {
        label: "Nama Lengkap",
        type: "text",
        required: true
    },

    email: {
        label: "Email",
        type: "email",
        required: true
    },

    phone: {
        label: "WhatsApp",
        type: "tel"
    },

    age: {
        label: "Usia",
        type: "number"
    },

    domicile: {
        label: "Domisili",
        type: "text"
    },

    profession: {
        label: "Profesi",
        type: "text"
    },

    participant_status: {
        label: "Status Peserta",
        type: "text"
    },

    has_hafalan: {
        label: "Memiliki Hafalan",
        type: "select",
        options: [
            { value: "false", label: "Belum" },
            { value: "true", label: "Ya" }
        ]
    },

    hafalan_juz: {
        label: "Jumlah Juz Yang Sudah Dihafal",
        type: "number"
    },

    target_juz: {
        label: "Target Setoran Juz",
        type: "text"
    },

    source_info: {
        label: "Tahu Program Dari Mana?",
        type: "text"
    },

    motivation: {
        label: "Motivasi Mengikuti Program",
        type: "textarea"
    },

    is_returning_student: {
        label: "Pernah Mengikuti Program Ngajikeun?",
        type: "select",
        options: [
            { value: "false", label: "Belum" },
            { value: "true", label: "Sudah" }
        ]
    }
};