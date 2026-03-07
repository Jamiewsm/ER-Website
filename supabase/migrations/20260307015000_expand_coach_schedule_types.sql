alter table public.coach_schedules
  drop constraint if exists coach_schedules_schedule_type_check;

alter table public.coach_schedules
  add constraint coach_schedules_schedule_type_check
  check (
    schedule_type in (
      'study',
      'training',
      'study_track',
      'spiritual_formation_track',
      'coaching_track',
      'practicum_track'
    )
  );
