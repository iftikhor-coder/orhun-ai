-- ===========================================================
-- ORHUN AI — Genres seed data (4 tilda)
-- 02_rls_policies.sql ni Run qilgandan KEYIN bu faylni Run qiling
-- ===========================================================

INSERT INTO public.genres (slug, name_en, name_uz, name_az, name_tr, icon, sort_order) VALUES
    ('pop',         'Pop',         'Pop',          'Pop',          'Pop',          '🎤', 1),
    ('rock',        'Rock',        'Rok',          'Rok',          'Rock',         '🎸', 2),
    ('hip-hop',     'Hip-Hop',     'Hip-Hop',      'Hip-Hop',      'Hip-Hop',      '🎧', 3),
    ('electronic',  'Electronic',  'Elektron',     'Elektronik',   'Elektronik',   '🎛️', 4),
    ('jazz',        'Jazz',        'Jazz',         'Caz',          'Jazz',         '🎷', 5),
    ('classical',   'Classical',   'Klassik',      'Klassik',      'Klasik',       '🎻', 6),
    ('rnb',         'R&B',         'R&B',          'R&B',          'R&B',          '🎙️', 7),
    ('country',     'Country',     'Kantri',       'Kantri',       'Country',      '🤠', 8),
    ('reggae',      'Reggae',      'Reggi',        'Reggi',        'Reggae',       '🌴', 9),
    ('folk',        'Folk',        'Xalq musiqasi', 'Xalq musiqisi', 'Halk',         '🪕', 10),
    ('latin',       'Latin',       'Lotin',        'Latın',        'Latin',        '💃', 11),
    ('blues',       'Blues',       'Blyuz',        'Blüz',         'Blues',        '🎺', 12),
    ('metal',       'Metal',       'Metal',        'Metal',        'Metal',        '🤘', 13),
    ('indie',       'Indie',       'Indi',         'İndi',         'Indie',        '🎵', 14),
    ('ambient',     'Ambient',     'Ambient',      'Ambient',      'Ambient',      '🌌', 15),
    ('lofi',        'Lo-Fi',       'Lo-Fi',        'Lo-Fi',        'Lo-Fi',        '☕', 16),
    ('uzbek-pop',   'Uzbek Pop',   'O''zbek pop',  'Özbək pop',    'Özbek pop',    '🇺🇿', 17),
    ('turkish-pop', 'Turkish Pop', 'Turk pop',     'Türk pop',     'Türk pop',     '🇹🇷', 18),
    ('azeri-mugham','Azeri Mugham','Ozarbayjon mugʻom','Azərbaycan muğamı','Azerbaycan muğamı','🇦🇿', 19)
ON CONFLICT (slug) DO NOTHING;

-- ===========================================================
-- TUGADI ✅
-- Tekshirish: SELECT * FROM public.genres ORDER BY sort_order;
-- ===========================================================
