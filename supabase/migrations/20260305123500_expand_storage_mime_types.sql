-- Expand storage bucket mime types and size limits for coach uploads

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'coach-task-files',
  'coach-task-files',
  false,
  104857600,
  ARRAY[
    'application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint','application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.ms-excel','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/haansofthwp','application/x-hwp','application/haansofthwpx','application/x-hwpx',
    'text/plain','text/csv','application/zip','application/x-zip-compressed',
    'image/png','image/jpeg','image/webp','image/gif',
    'video/mp4','video/quicktime','audio/mpeg','audio/wav','audio/x-m4a','audio/mp4','audio/aac'
  ]::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'coach-materials',
  'coach-materials',
  false,
  104857600,
  ARRAY[
    'application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint','application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.ms-excel','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/haansofthwp','application/x-hwp','application/haansofthwpx','application/x-hwpx',
    'text/plain','text/csv','application/zip','application/x-zip-compressed',
    'image/png','image/jpeg','image/webp','image/gif',
    'video/mp4','video/quicktime','audio/mpeg','audio/wav','audio/x-m4a','audio/mp4','audio/aac'
  ]::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;
