alter table session_exercises
  alter column notes type jsonb
  using case
    when notes is null then null
    when notes ~ '^\s*[{[]' then notes::jsonb
    else to_jsonb(notes)
  end;
