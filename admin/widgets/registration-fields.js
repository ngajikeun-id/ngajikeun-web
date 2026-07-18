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

class RegistrationFieldsControl {

}