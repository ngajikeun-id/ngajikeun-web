const REGISTRATION_FIELDS = [
    {
        title: "📋 Data Pribadi",
        fields: [
            ["full_name", "Nama Lengkap"],
            ["phone", "WhatsApp"],
            ["email", "Email"],
            ["domicile", "Domisili"],
            ["age", "Usia"],
            ["profession", "Profesi"]
        ]
    },
    {
        title: "📖 Hafalan",
        fields: [
            ["has_hafalan", "Memiliki Hafalan"],
            ["hafalan_juz", "Jumlah Juz Hafalan"],
            ["target_juz", "Target Juz"]
        ]
    },
    {
        title: "🎓 Program",
        fields: [
            ["batch", "Batch"],
            ["participant_status", "Status Peserta"]
        ]
    },
    {
        title: "📝 Lainnya",
        fields: [
            ["motivation", "Motivasi"],
            ["source_info", "Sumber Informasi"],
            ["is_returning_student", "Santri Lama"]
        ]
    }
];

console.log("✅ Registration Fields Widget Loaded");

function RegistrationFieldsControl(props) {

    console.log("🚀 Widget Props:", props);

    return h(
        "div",
        {
            style: {
                padding: "16px",
                border: "1px solid #ddd",
                borderRadius: "12px",
                background: "#f8fafc"
            }
        },
        [
            h("h3", {}, "📋 Registration Fields"),
            h("label", {}, [
                h("input", { type: "checkbox" }),
                " Nama Lengkap"
            ]),
            h("br"),
            h("label", {}, [
                h("input", { type: "checkbox" }),
                " Email"
            ])
        ]
    );

}

CMS.registerWidget(
    "registration-fields",
    RegistrationFieldsControl
);