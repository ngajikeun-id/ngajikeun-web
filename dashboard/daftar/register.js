const { data, error } = await supabase
    .from("registrations")
    .insert([
        {
            batch_id,
            full_name,
            email,
            phone,
            age,
            domicile,
            profession,
            has_hafalan,
            hafalan_juz,
            target_juz,
            source_info,
            motivation
        }
    ]);