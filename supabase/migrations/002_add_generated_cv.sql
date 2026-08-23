alter table applications add column generated_cv_text text;
alter table applications alter column job_description drop not null;
