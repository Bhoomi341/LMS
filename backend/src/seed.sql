-- Sample published subject with sections and videos (YouTube URLs)

INSERT INTO subjects (id, title, slug, description, is_published) VALUES
(1, 'Web Foundations', 'web-foundations', 'HTML, CSS, and browser basics.', 1)
ON DUPLICATE KEY UPDATE title = VALUES(title), description = VALUES(description), is_published = 1;

INSERT INTO sections (id, subject_id, title, order_index) VALUES
(1, 1, 'Getting started', 0),
(2, 1, 'Layout & style', 1)
ON DUPLICATE KEY UPDATE title = VALUES(title), order_index = VALUES(order_index);

INSERT INTO videos (id, section_id, title, description, youtube_url, order_index, duration_seconds) VALUES
(1, 1, 'What is the web?', 'Overview', 'https://www.youtube.com/watch?v=Dxcc6ycZ73M', 0, 600),
(2, 1, 'How browsers work', 'Rendering pipeline intro', 'https://www.youtube.com/watch?v=0BS5wSncbgk', 1, 900),
(3, 2, 'CSS box model', 'Margins, padding, borders', 'https://www.youtube.com/watch?v=rIO5326FgPE', 0, 720),
(4, 2, 'Flexbox in 100 seconds', 'Quick flex primer', 'https://www.youtube.com/watch?v=K74l26pE4YA', 1, 120)
ON DUPLICATE KEY UPDATE
  title = VALUES(title),
  description = VALUES(description),
  youtube_url = VALUES(youtube_url),
  order_index = VALUES(order_index),
  duration_seconds = VALUES(duration_seconds);
