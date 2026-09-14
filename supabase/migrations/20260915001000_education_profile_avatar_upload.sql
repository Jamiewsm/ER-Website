-- 교육 참여자가 기존 프로필 버킷의 본인 경로에 사진을 추가하도록 허용한다.
CREATE POLICY education_avatars_insert_own
ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'coach-avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
  AND EXISTS (
    SELECT 1 FROM public.edu_enrollments AS enrollment
    WHERE enrollment.user_id = auth.uid()
      AND enrollment.status IN ('active', 'completed')
  )
);

COMMENT ON POLICY education_avatars_insert_own ON storage.objects IS
  '활동 중이거나 수료한 교육 참여자의 본인 프로필 사진 추가만 허용한다. 기존 코치 정책과 다른 파일 접근 권한은 유지한다.';

-- Storage 삭제 API가 파일을 확인할 수 있도록 본인 사진 조회만 함께 허용한다.
CREATE POLICY education_avatars_select_own
ON storage.objects
FOR SELECT TO authenticated
USING (
  bucket_id = 'coach-avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
  AND EXISTS (
    SELECT 1 FROM public.edu_enrollments AS enrollment
    WHERE enrollment.user_id = auth.uid()
      AND enrollment.status IN ('active', 'completed')
  )
);

COMMENT ON POLICY education_avatars_select_own ON storage.objects IS
  '프로필 저장 실패 시 기존 본인 삭제 정책과 함께 신규 파일을 정리할 수 있도록 본인 사진 조회만 허용한다.';
