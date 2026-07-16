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
        label: "Nomor WhatsApp",
        type: "tel",
        required: true
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

    has_hafalan: {
        label: "Memiliki Hafalan",
        type: "select",
        options: ["Ya", "Tidak"]
    },

    hafalan_juz: {
        label: "Jumlah Juz Hafalan",
        type: "number"
    },

    target_juz: {
        label: "Target Juz",
        type: "number"
    },

    source_info: {
        label: "Tahu Program Dari Mana",
        type: "text"
    },

    motivation: {
        label: "Motivasi",
        type: "textarea"
    }
};