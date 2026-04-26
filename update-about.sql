-- Update the About section content
UPDATE site_content
SET data = '{
  "tag": "THE STORY",
  "title": "ONLY FOR THOSE WHO<br>UNDERSTAND REAL<br>FASHION",
  "text1": "Grail Plug Supply is built for individuals who recognize authenticity, rarity, and timeless design. We carefully source dead-stock, vintage, and archive pieces from respected fashion houses and underground labels across the world.",
  "text2": "Every item is selected with purpose — one size, one piece, one chance. Once it''s sold, it becomes part of someone''s personal collection forever. No restocks. No replicas. Only genuine, curated fashion.",
  "values": [
    {"title": "Authenticated", "desc": "Every piece verified before listing"},
    {"title": "1 of 1", "desc": "No two pieces are the same"},
    {"title": "Worldwide Shipping", "desc": "We ship to every corner of the globe"}
  ]
}'
WHERE section = 'about';
