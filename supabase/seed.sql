-- Seed demo — Shop House Giarre
-- Prezzi e stock DEMO: da sostituire con i dati reali dal pannello admin o via CSV.
-- Foto: placeholder (/placeholder.svg) finché il negozio non fornisce quelle reali.

insert into brands (nome, slug) values
  ('Caleffi', 'caleffi'),
  ('Alviero Martini', 'alviero-martini'),
  ('Trussardi', 'trussardi'),
  ('Gianfranco Ferré', 'gianfranco-ferre'),
  ('Laura Biagiotti', 'laura-biagiotti'),
  ('Shop House', 'shop-house')
on conflict (slug) do nothing;

insert into categories (nome, slug, parent_id, ordine) values ('Biancheria letto', 'biancheria-letto', null, 0) on conflict (slug) do nothing;
insert into categories (nome, slug, parent_id, ordine) values ('Lenzuola e completi letto', 'lenzuola', (select id from categories where slug='biancheria-letto'), 1) on conflict (slug) do nothing;
insert into categories (nome, slug, parent_id, ordine) values ('Copripiumini e piumoni', 'copripiumini', (select id from categories where slug='biancheria-letto'), 2) on conflict (slug) do nothing;
insert into categories (nome, slug, parent_id, ordine) values ('Trapunte e copriletti', 'trapunte', (select id from categories where slug='biancheria-letto'), 3) on conflict (slug) do nothing;
insert into categories (nome, slug, parent_id, ordine) values ('Cuscini e guanciali', 'cuscini', (select id from categories where slug='biancheria-letto'), 4) on conflict (slug) do nothing;
insert into categories (nome, slug, parent_id, ordine) values ('Bagno', 'bagno', null, 5) on conflict (slug) do nothing;
insert into categories (nome, slug, parent_id, ordine) values ('Asciugamani e spugne', 'asciugamani', (select id from categories where slug='bagno'), 6) on conflict (slug) do nothing;
insert into categories (nome, slug, parent_id, ordine) values ('Accappatoi', 'accappatoi', (select id from categories where slug='bagno'), 7) on conflict (slug) do nothing;
insert into categories (nome, slug, parent_id, ordine) values ('Tappeti e accessori bagno', 'tappeti-bagno', (select id from categories where slug='bagno'), 8) on conflict (slug) do nothing;
insert into categories (nome, slug, parent_id, ordine) values ('Cucina e tavola', 'cucina-e-tavola', null, 9) on conflict (slug) do nothing;
insert into categories (nome, slug, parent_id, ordine) values ('Tovaglie e runner', 'tovaglie', (select id from categories where slug='cucina-e-tavola'), 10) on conflict (slug) do nothing;
insert into categories (nome, slug, parent_id, ordine) values ('Strofinacci e presine', 'strofinacci', (select id from categories where slug='cucina-e-tavola'), 11) on conflict (slug) do nothing;
insert into categories (nome, slug, parent_id, ordine) values ('Casalinghi', 'casalinghi', (select id from categories where slug='cucina-e-tavola'), 12) on conflict (slug) do nothing;
insert into categories (nome, slug, parent_id, ordine) values ('Intimo e pigiami', 'intimo-e-pigiami', null, 13) on conflict (slug) do nothing;
insert into categories (nome, slug, parent_id, ordine) values ('Pigiami donna / uomo / bambino', 'pigiami', (select id from categories where slug='intimo-e-pigiami'), 14) on conflict (slug) do nothing;
insert into categories (nome, slug, parent_id, ordine) values ('Corsetteria', 'corsetteria', (select id from categories where slug='intimo-e-pigiami'), 15) on conflict (slug) do nothing;
insert into categories (nome, slug, parent_id, ordine) values ('Intimo uomo', 'intimo-uomo', (select id from categories where slug='intimo-e-pigiami'), 16) on conflict (slug) do nothing;
insert into categories (nome, slug, parent_id, ordine) values ('Casa e arredo tessile', 'casa-e-arredo-tessile', null, 17) on conflict (slug) do nothing;
insert into categories (nome, slug, parent_id, ordine) values ('Igiene casa e persona', 'igiene-casa-e-persona', null, 18) on conflict (slug) do nothing;
insert into categories (nome, slug, parent_id, ordine) values ('Garden', 'garden', null, 19) on conflict (slug) do nothing;
insert into categories (nome, slug, parent_id, ordine) values ('Cartoleria, scuola e party', 'cartoleria-scuola-party', null, 20) on conflict (slug) do nothing;

-- Tovaglia da tavola 100% cotone
insert into products (titolo, slug, brand_id, category_id, descrizione, punti_chiave, materiale, cura, stato, in_evidenza) values (
  'Tovaglia da tavola 100% cotone', 'tovaglia-cotone-alviero-martini',
  (select id from brands where slug='alviero-martini'),
  (select id from categories where slug='tovaglie'),
  'La tovaglia Alviero Martini porta sulla tavola l''eleganza inconfondibile del marchio, con un tessuto in puro cotone dalla mano piacevole e dalla buona resistenza ai lavaggi. Misura 150×180 cm ed è perfetta per un tavolo da sei persone, sia per il pranzo di tutti i giorni sia per le occasioni speciali. La stampa mantiene colori nitidi anche dopo ripetuti lavaggi in lavatrice a 40 gradi e il tessuto si stira facilmente. Un accessorio di marca a prezzo da negozio, ideale anche come idea regalo per chi ama apparecchiare con gusto e rinnovare la casa con un tocco di stile.',
  array['100% cotone resistente e morbido', 'Misura 150×180 cm, adatta a 6 persone', 'Lavabile in lavatrice a 40°', 'Stampa con motivo firmato Alviero Martini', 'Prodotto in Italia'],
  '100% cotone', 'Lavaggio in lavatrice a 40°, stiratura a media temperatura.', 'published', true
) on conflict (slug) do nothing;
insert into product_variants (product_id, sku, misura, colore, taglia, prezzo, prezzo_barrato, stock) values ((select id from products where slug='tovaglia-cotone-alviero-martini'), 'SH-AM-TOV-150180', '150×180 cm', null, null, 4990, null, 6) on conflict (sku) do nothing;
insert into product_images (product_id, url, alt, ordine) values ((select id from products where slug='tovaglia-cotone-alviero-martini'), '/placeholder.svg', 'Tovaglia da tavola 100% cotone (immagine segnaposto)', 0);

-- Trapunta invernale jacquard matrimoniale
insert into products (titolo, slug, brand_id, category_id, descrizione, punti_chiave, materiale, cura, stato, in_evidenza) values (
  'Trapunta invernale jacquard matrimoniale', 'trapunta-jacquard-laura-biagiotti',
  (select id from brands where slug='laura-biagiotti'),
  (select id from categories where slug='trapunte'),
  'La trapunta jacquard Laura Biagiotti è la scelta giusta per affrontare l''inverno con stile. Il tessuto lavorato in jacquard crea un disegno raffinato e tono su tono, mentre l''imbottitura in fibra cava siliconata trattiene il calore senza appesantire. Con la misura matrimoniale 260×270 cm copre comodamente il letto e ricade morbida ai lati. Si abbina facilmente a lenzuola e cuscini in tinta unita, nei colori rosa e beige. Facile da curare, si lava a 30 gradi con programma delicato e mantiene a lungo volume e morbidezza. Un capo di marca che rinnova la camera da letto.',
  array['Tessuto jacquard con trama elegante', 'Misura matrimoniale 260×270 cm', 'Imbottitura in fibra cava siliconata, calda e leggera', 'Lavabile a 30° ciclo delicato', 'Disponibile in rosa e beige'],
  'Jacquard di poliestere, imbottitura in fibra cava siliconata', 'Lavaggio a 30° delicato o in lavanderia; non candeggiare.', 'published', true
) on conflict (slug) do nothing;
insert into product_variants (product_id, sku, misura, colore, taglia, prezzo, prezzo_barrato, stock) values ((select id from products where slug='trapunta-jacquard-laura-biagiotti'), 'SH-LB-TRA-ROSA', '260×270 cm', 'Rosa', null, 9900, 12900, 2) on conflict (sku) do nothing;
insert into product_variants (product_id, sku, misura, colore, taglia, prezzo, prezzo_barrato, stock) values ((select id from products where slug='trapunta-jacquard-laura-biagiotti'), 'SH-LB-TRA-BEIGE', '260×270 cm', 'Beige', null, 9900, 12900, 2) on conflict (sku) do nothing;
insert into product_images (product_id, url, alt, ordine) values ((select id from products where slug='trapunta-jacquard-laura-biagiotti'), '/placeholder.svg', 'Trapunta invernale jacquard matrimoniale (immagine segnaposto)', 0);

-- Completo lenzuola in raso di cotone
insert into products (titolo, slug, brand_id, category_id, descrizione, punti_chiave, materiale, cura, stato, in_evidenza) values (
  'Completo lenzuola in raso di cotone', 'completo-lenzuola-raso-trussardi',
  (select id from brands where slug='trussardi'),
  (select id from categories where slug='lenzuola'),
  'Il completo lenzuola Trussardi in raso di cotone unisce la freschezza della fibra naturale alla lucentezza tipica del raso. Al tatto è liscio e setoso, ideale per chi cerca un riposo curato in ogni stagione. Il set comprende lenzuolo sopra, lenzuolo sotto con angoli e federe coordinate, ed è disponibile in una piazza e mezza o matrimoniale, nei colori bianco e grigio. Le finiture accurate e il logo discreto danno alla camera un''immagine elegante. Si lava in lavatrice a 40 gradi e richiede una stiratura leggera. Un classico della biancheria di marca, adatto anche come regalo o corredo.',
  array['Raso di cotone liscio e setoso', 'Sopra, sotto con angoli e due federe', 'Misure una piazza e mezza o matrimoniale', 'Lavabile in lavatrice a 40°', 'Bordo e finiture firmate Trussardi'],
  'Raso di cotone', 'Lavaggio a 40°, stiratura leggera a temperatura media.', 'published', true
) on conflict (slug) do nothing;
insert into product_variants (product_id, sku, misura, colore, taglia, prezzo, prezzo_barrato, stock) values ((select id from products where slug='completo-lenzuola-raso-trussardi'), 'SH-TR-LEN-1P5-BIA', 'Una piazza e mezza', 'Bianco', null, 8990, null, 2) on conflict (sku) do nothing;
insert into product_variants (product_id, sku, misura, colore, taglia, prezzo, prezzo_barrato, stock) values ((select id from products where slug='completo-lenzuola-raso-trussardi'), 'SH-TR-LEN-1P5-GRI', 'Una piazza e mezza', 'Grigio', null, 8990, null, 2) on conflict (sku) do nothing;
insert into product_variants (product_id, sku, misura, colore, taglia, prezzo, prezzo_barrato, stock) values ((select id from products where slug='completo-lenzuola-raso-trussardi'), 'SH-TR-LEN-MAT-BIA', 'Matrimoniale', 'Bianco', null, 8990, null, 2) on conflict (sku) do nothing;
insert into product_variants (product_id, sku, misura, colore, taglia, prezzo, prezzo_barrato, stock) values ((select id from products where slug='completo-lenzuola-raso-trussardi'), 'SH-TR-LEN-MAT-GRI', 'Matrimoniale', 'Grigio', null, 8990, null, 2) on conflict (sku) do nothing;
insert into product_images (product_id, url, alt, ordine) values ((select id from products where slug='completo-lenzuola-raso-trussardi'), '/placeholder.svg', 'Completo lenzuola in raso di cotone (immagine segnaposto)', 0);

-- Completo copripiumino in percalle stampato
insert into products (titolo, slug, brand_id, category_id, descrizione, punti_chiave, materiale, cura, stato, in_evidenza) values (
  'Completo copripiumino in percalle stampato', 'copripiumino-percalle-caleffi',
  (select id from brands where slug='caleffi'),
  (select id from categories where slug='copripiumini'),
  'Il completo copripiumino Caleffi in percalle stampato porta in camera colore e freschezza. Il percalle di cotone ha una trama fitta che lo rende resistente, traspirante e piacevole sulla pelle, adatto a tutte le stagioni. Il set comprende il copripiumino con chiusura e le federe coordinate, con una stampa dai colori vivi che resta intatta nel tempo. È disponibile in misura singolo o matrimoniale. Si lava in lavatrice a 40 gradi e asciuga rapidamente. Caleffi è un marchio italiano specializzato in tessile per la casa: una scelta affidabile per rinnovare il letto senza rinunciare alla qualità.',
  array['Percalle di puro cotone, fresco e resistente', 'Copripiumino con federe coordinate', 'Fantasia stampata Caleffi', 'Misure singolo e matrimoniale', 'Lavabile in lavatrice a 40°'],
  'Percalle di cotone', 'Lavaggio a 40°, asciugatura in tamburo a bassa temperatura.', 'published', false
) on conflict (slug) do nothing;
insert into product_variants (product_id, sku, misura, colore, taglia, prezzo, prezzo_barrato, stock) values ((select id from products where slug='copripiumino-percalle-caleffi'), 'SH-CA-COP-SING', 'Singolo', null, null, 5990, 7490, 5) on conflict (sku) do nothing;
insert into product_variants (product_id, sku, misura, colore, taglia, prezzo, prezzo_barrato, stock) values ((select id from products where slug='copripiumino-percalle-caleffi'), 'SH-CA-COP-MAT', 'Matrimoniale', null, null, 5990, 7490, 5) on conflict (sku) do nothing;
insert into product_images (product_id, url, alt, ordine) values ((select id from products where slug='copripiumino-percalle-caleffi'), '/placeholder.svg', 'Completo copripiumino in percalle stampato (immagine segnaposto)', 0);

-- Coppia asciugamani viso + ospite in spugna
insert into products (titolo, slug, brand_id, category_id, descrizione, punti_chiave, materiale, cura, stato, in_evidenza) values (
  'Coppia asciugamani viso + ospite in spugna', 'coppia-asciugamani-spugna-gianfranco-ferre',
  (select id from brands where slug='gianfranco-ferre'),
  (select id from categories where slug='asciugamani'),
  'La coppia di asciugamani Gianfranco Ferré in spugna di cotone porta in bagno un tocco di eleganza quotidiana. Il set è formato da un asciugamano viso da 50×100 cm e da uno ospite da 40×60 cm, entrambi con una spugna da 500 grammi al metro quadro, morbida al tatto e molto assorbente. Il bordo jacquard riporta il disegno firmato del marchio. Disponibile in bianco, tortora e blu, si abbina facilmente a ogni arredo. Si lava a 60 gradi e conserva a lungo la morbidezza, soprattutto evitando l''ammorbidente. Perfetto da tenere in bagno o da regalare agli ospiti.',
  array['Spugna di cotone 500 g/m², morbida e assorbente', 'Set da due: viso 50×100 cm e ospite 40×60 cm', 'Bordo jacquard con logo Gianfranco Ferré', 'Colori bianco, tortora e blu', 'Lavabile a 60°'],
  'Spugna di cotone 500 g/m²', 'Lavaggio a 60°, no ammorbidente per mantenere l''assorbenza.', 'published', false
) on conflict (slug) do nothing;
insert into product_variants (product_id, sku, misura, colore, taglia, prezzo, prezzo_barrato, stock) values ((select id from products where slug='coppia-asciugamani-spugna-gianfranco-ferre'), 'SH-GF-ASC-BIA', null, 'Bianco', null, 3490, null, 4) on conflict (sku) do nothing;
insert into product_variants (product_id, sku, misura, colore, taglia, prezzo, prezzo_barrato, stock) values ((select id from products where slug='coppia-asciugamani-spugna-gianfranco-ferre'), 'SH-GF-ASC-TOR', null, 'Tortora', null, 3490, null, 4) on conflict (sku) do nothing;
insert into product_variants (product_id, sku, misura, colore, taglia, prezzo, prezzo_barrato, stock) values ((select id from products where slug='coppia-asciugamani-spugna-gianfranco-ferre'), 'SH-GF-ASC-BLU', null, 'Blu', null, 3490, null, 4) on conflict (sku) do nothing;
insert into product_images (product_id, url, alt, ordine) values ((select id from products where slug='coppia-asciugamani-spugna-gianfranco-ferre'), '/placeholder.svg', 'Coppia asciugamani viso + ospite in spugna (immagine segnaposto)', 0);

-- Set 3 strofinacci cucina in cotone
insert into products (titolo, slug, brand_id, category_id, descrizione, punti_chiave, materiale, cura, stato, in_evidenza) values (
  'Set 3 strofinacci cucina in cotone', 'set-3-strofinacci-alviero-martini',
  (select id from brands where slug='alviero-martini'),
  (select id from categories where slug='strofinacci'),
  'Il set di tre strofinacci Alviero Martini rende più bella anche la cucina di ogni giorno. Realizzati in cotone al 100%, misurano 50×70 cm e asciugano stoviglie, bicchieri e piani di lavoro con grande efficacia, senza lasciare pelucchi. La fantasia geometrica, dai colori armoniosi, si abbina a ogni stile di cucina e dona un tocco di marca anche agli accessori più semplici. Resistenti ai lavaggi frequenti, si lavano a 60 gradi e possono andare in asciugatrice. Un set pratico e di qualità, ideale anche come piccolo regalo per chi ama la casa curata nei dettagli.',
  array['Set di 3 strofinacci in 100% cotone', 'Misura 50×70 cm ciascuno', 'Fantasia geometrica Alviero Martini', 'Alto potere assorbente', 'Lavabile a 60°'],
  '100% cotone', 'Lavaggio a 60°, può essere asciugato in tamburo.', 'published', false
) on conflict (slug) do nothing;
insert into product_variants (product_id, sku, misura, colore, taglia, prezzo, prezzo_barrato, stock) values ((select id from products where slug='set-3-strofinacci-alviero-martini'), 'SH-AM-STR-GEO', null, 'Fantasia geo', null, 1990, null, 15) on conflict (sku) do nothing;
insert into product_images (product_id, url, alt, ordine) values ((select id from products where slug='set-3-strofinacci-alviero-martini'), '/placeholder.svg', 'Set 3 strofinacci cucina in cotone (immagine segnaposto)', 0);

-- Pigiama donna lungo in cotone
insert into products (titolo, slug, brand_id, category_id, descrizione, punti_chiave, materiale, cura, stato, in_evidenza) values (
  'Pigiama donna lungo in cotone', 'pigiama-donna-lungo-cotone',
  (select id from brands where slug='shop-house'),
  (select id from categories where slug='pigiami'),
  'Il pigiama lungo da donna in cotone è il compagno ideale per le notti fresche. Il jersey di cotone è morbido, elastico e traspirante, per un comfort che dura dalla sera al mattino. È composto da giacca con bottoni e pantalone lungo con elastico in vita, con una vestibilità comoda che non stringe. Disponibile nelle taglie S, M, L e XL, si lava facilmente in lavatrice a 40 gradi e mantiene la forma anche dopo molti lavaggi. Un capo semplice e confortevole selezionato da Shop House, adatto sia all''uso quotidiano sia come pensiero per chi si vuole coccolare.',
  array['Cotone jersey morbido e traspirante', 'Giacca con bottoni e pantalone lungo', 'Taglie da S a XL', 'Vestibilità comoda', 'Lavabile in lavatrice a 40°'],
  'Cotone jersey', 'Lavaggio a 40°, non candeggiare.', 'published', false
) on conflict (slug) do nothing;
insert into product_variants (product_id, sku, misura, colore, taglia, prezzo, prezzo_barrato, stock) values ((select id from products where slug='pigiama-donna-lungo-cotone'), 'SH-SH-PIG-S', null, null, 'S', 2490, 2990, 5) on conflict (sku) do nothing;
insert into product_variants (product_id, sku, misura, colore, taglia, prezzo, prezzo_barrato, stock) values ((select id from products where slug='pigiama-donna-lungo-cotone'), 'SH-SH-PIG-M', null, null, 'M', 2490, 2990, 5) on conflict (sku) do nothing;
insert into product_variants (product_id, sku, misura, colore, taglia, prezzo, prezzo_barrato, stock) values ((select id from products where slug='pigiama-donna-lungo-cotone'), 'SH-SH-PIG-L', null, null, 'L', 2490, 2990, 5) on conflict (sku) do nothing;
insert into product_variants (product_id, sku, misura, colore, taglia, prezzo, prezzo_barrato, stock) values ((select id from products where slug='pigiama-donna-lungo-cotone'), 'SH-SH-PIG-XL', null, null, 'XL', 2490, 2990, 5) on conflict (sku) do nothing;
insert into product_images (product_id, url, alt, ordine) values ((select id from products where slug='pigiama-donna-lungo-cotone'), '/placeholder.svg', 'Pigiama donna lungo in cotone (immagine segnaposto)', 0);

-- Accappatoio unisex in spugna
insert into products (titolo, slug, brand_id, category_id, descrizione, punti_chiave, materiale, cura, stato, in_evidenza) values (
  'Accappatoio unisex in spugna', 'accappatoio-spugna-caleffi',
  (select id from brands where slug='caleffi'),
  (select id from categories where slug='accappatoi'),
  'L''accappatoio Caleffi in spugna di cotone avvolge con morbidezza dopo la doccia o il bagno. Il modello unisex ha il collo a scialle, la cintura in vita e due pratiche tasche anteriori. La spugna è densa e molto assorbente, asciuga bene e resta piacevole al tatto anche dopo molti lavaggi. È disponibile nelle taglie S/M e L/XL, per adattarsi a lui e a lei. Si lava in lavatrice a 60 gradi e può essere asciugato in tamburo. Un classico del bagno firmato da un marchio italiano affidabile, utile in casa, dopo la palestra o come regalo sempre gradito.',
  array['Spugna di cotone morbida e assorbente', 'Modello unisex con collo sciallato e cintura', 'Due tasche anteriori', 'Taglie S/M e L/XL', 'Lavabile a 60°'],
  'Spugna di cotone', 'Lavaggio a 60°, asciugatura in tamburo.', 'published', false
) on conflict (slug) do nothing;
insert into product_variants (product_id, sku, misura, colore, taglia, prezzo, prezzo_barrato, stock) values ((select id from products where slug='accappatoio-spugna-caleffi'), 'SH-CA-ACC-SM', null, null, 'S/M', 3990, null, 3) on conflict (sku) do nothing;
insert into product_variants (product_id, sku, misura, colore, taglia, prezzo, prezzo_barrato, stock) values ((select id from products where slug='accappatoio-spugna-caleffi'), 'SH-CA-ACC-LXL', null, null, 'L/XL', 3990, null, 4) on conflict (sku) do nothing;
insert into product_images (product_id, url, alt, ordine) values ((select id from products where slug='accappatoio-spugna-caleffi'), '/placeholder.svg', 'Accappatoio unisex in spugna (immagine segnaposto)', 0);

-- Tappeto bagno antiscivolo 50×80
insert into products (titolo, slug, brand_id, category_id, descrizione, punti_chiave, materiale, cura, stato, in_evidenza) values (
  'Tappeto bagno antiscivolo 50×80', 'tappeto-bagno-antiscivolo-50x80',
  (select id from brands where slug='shop-house'),
  (select id from categories where slug='tappeti-bagno'),
  'Il tappeto da bagno antiscivolo 50×80 cm unisce sicurezza e comfort. La superficie in cotone è soffice sotto i piedi e assorbe l''acqua che gocciola all''uscita dalla doccia, mentre il retro in lattice evita gli scivolamenti sul pavimento bagnato, una caratteristica utile soprattutto in presenza di bambini e anziani. Disponibile in grigio e sabbia, due tonalità neutre che si abbinano a ogni rivestimento. Si lava in lavatrice a 30 gradi con ciclo delicato ed è consigliato lasciarlo asciugare all''aria. Un accessorio semplice, pratico e dal prezzo accessibile, scelto da Shop House per il bagno di tutti i giorni.',
  array['Retro in lattice antiscivolo', 'Misura 50×80 cm', 'Superficie morbida e assorbente', 'Colori grigio e sabbia', 'Lavabile a 30°'],
  'Cotone con retro in lattice antiscivolo', 'Lavaggio a 30° delicato, non asciugare in tamburo.', 'published', false
) on conflict (slug) do nothing;
insert into product_variants (product_id, sku, misura, colore, taglia, prezzo, prezzo_barrato, stock) values ((select id from products where slug='tappeto-bagno-antiscivolo-50x80'), 'SH-SH-TAP-GRI', null, 'Grigio', null, 1490, null, 9) on conflict (sku) do nothing;
insert into product_variants (product_id, sku, misura, colore, taglia, prezzo, prezzo_barrato, stock) values ((select id from products where slug='tappeto-bagno-antiscivolo-50x80'), 'SH-SH-TAP-SAB', null, 'Sabbia', null, 1490, null, 9) on conflict (sku) do nothing;
insert into product_images (product_id, url, alt, ordine) values ((select id from products where slug='tappeto-bagno-antiscivolo-50x80'), '/placeholder.svg', 'Tappeto bagno antiscivolo 50×80 (immagine segnaposto)', 0);

-- Guanciale in memory foam
insert into products (titolo, slug, brand_id, category_id, descrizione, punti_chiave, materiale, cura, stato, in_evidenza) values (
  'Guanciale in memory foam', 'guanciale-memory-foam-caleffi',
  (select id from brands where slug='caleffi'),
  (select id from categories where slug='cuscini'),
  'Il guanciale Caleffi in memory foam si adatta alla forma di testa e collo per offrire un sostegno costante durante tutta la notte. Il materiale viscoelastico reagisce al calore del corpo e ridistribuisce la pressione, aiutando a ridurre le tensioni cervicali. Misura 40×70 cm e ha una fodera in cotone sfoderabile, lavabile in lavatrice a 40 gradi, mentre l''anima in memory non va lavata ma solo arieggiata. È traspirante e anallergico, adatto a chi dorme sul fianco o sulla schiena. Un guanciale di marca pensato per migliorare il riposo, a un prezzo conveniente rispetto ai modelli di fascia alta.',
  array['Memory foam che segue la forma del collo', 'Misura 40×70 cm', 'Fodera in cotone sfoderabile', 'Traspirante e anallergico', 'Prodotto con materiali certificati'],
  'Memory foam, fodera in cotone', 'Fodera sfoderabile lavabile a 40°; il memory non va lavato.', 'published', false
) on conflict (slug) do nothing;
insert into product_variants (product_id, sku, misura, colore, taglia, prezzo, prezzo_barrato, stock) values ((select id from products where slug='guanciale-memory-foam-caleffi'), 'SH-CA-GUA-4070', '40×70 cm', null, null, 2990, 3990, 9) on conflict (sku) do nothing;
insert into product_images (product_id, url, alt, ordine) values ((select id from products where slug='guanciale-memory-foam-caleffi'), '/placeholder.svg', 'Guanciale in memory foam (immagine segnaposto)', 0);

insert into settings (chiave, valore) values
  ('soglia_spedizione_gratuita', '{"cents": null, "todo": "da decidere col negozio"}'),
  ('costo_spedizione', '{"cents": null, "todo": "da confermare col negozio"}'),
  ('negozio', '{"ragione_sociale":"Shop House S.r.l.","piva":"04970720878","indirizzo":"Via Fratelli Cairoli 109, 95014 Giarre (CT)","telefono":"+39 095 779 1101"}'),
  ('orari', '{"lun":["16:00-20:00"],"mar-sab":["08:30-13:00","16:00-20:00"],"dom":[]}')
on conflict (chiave) do nothing;
