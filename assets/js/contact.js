/*
 * Formulaire de rendez-vous : prépare un courriel (mailto) sans aucun service tiers.
 * Aucune donnée ne quitte l'appareil tant que la personne n'envoie pas le courriel elle-même.
 * Pour recevoir les demandes directement, remplacer par un service de formulaire
 * (le déclarer alors dans la politique de confidentialité : transfert hors Québec possible).
 */
(() => {
  const form = document.querySelector('[data-form]');
  if (!form) return;
  const success = document.querySelector('[data-success]');
  const preview = document.querySelector('[data-preview]');
  const TO = 'contact@milanoperformance.ca';

  // Préremplissage depuis l'URL : ?sujet=piece&produit=…, ?service=…, ?vehicule=McLaren
  const q = new URLSearchParams(location.search);
  const setSujet = (v) => { const r = form.querySelector(`input[name="sujet"][value="${v}"]`); if (r) r.checked = true; };
  if (q.get('sujet') === 'piece') setSujet('piece');
  if (q.get('sujet') === 'autre-marque') { setSujet('autre'); form.marque.value = 'Autre marque'; }
  if (q.get('produit')) form.produit.value = q.get('produit');
  if (q.get('vehicule') === 'McLaren') { form.marque.value = 'McLaren'; form.service.value = 'McLaren'; }
  const svc = q.get('service');
  if (svc) {
    const map = { Moteur: 'Entretien', Freinage: 'Réparation', Suspension: 'Réparation', Transmission: 'Réparation', 'Échappement': 'Pièces de performance', Roues: 'Pièces de performance' };
    const v = map[svc] || svc;
    if ([...form.service.options].some((o) => o.value === v || o.text === v)) form.service.value = v;
    if (!form.message.value && map[svc]) form.message.value = `Système : ${svc}. `;
  }

  function sync() {
    const s = form.sujet.value;
    form.querySelectorAll('[data-when]').forEach((el) => { el.hidden = el.dataset.when !== s; });
  }
  form.addEventListener('change', (e) => { if (e.target.name === 'sujet') sync(); });
  sync();

  const show = (id, on, input) => {
    document.getElementById(id).hidden = !on;
    if (input) input.setAttribute('aria-invalid', String(on));
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const nom = form.nom.value.trim();
    const tel = form.tel.value.trim();
    const mail = form.courriel.value.trim();
    const mailOk = !mail || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail);
    const okNom = !!nom;
    const okContact = (tel.replace(/\D/g, '').length >= 10 || (mail && mailOk)) && mailOk;
    show('nom-err', !okNom, form.nom);
    show('contact-err', !okContact, form.courriel);
    if (!okNom) { form.nom.focus(); return; }
    if (!okContact) { (mail ? form.courriel : form.tel).focus(); return; }

    const sujet = form.sujet.value;
    const vehicule = [form.marque.value, form.modele.value.trim()].filter(Boolean).join(' ');
    const titre = { 'rendez-vous': 'Demande de rendez-vous', piece: 'Demande de pièce', autre: 'Question' }[sujet];
    const details = [
      ['Nom', nom],
      ['Téléphone', tel],
      ['Courriel', mail],
      ['Véhicule', vehicule],
      ['Service', sujet === 'rendez-vous' ? form.service.value : ''],
      ['Disponibilités', sujet === 'rendez-vous' ? form.dates.value.trim() : ''],
      ['Pièce', sujet === 'piece' ? form.produit.value.trim() : ''],
    ].filter(([, v]) => v).map(([k, v]) => `${k} : ${v}`);
    const message = form.message.value.trim();
    const body = [`${titre}${vehicule ? ' · ' + vehicule : ''}`, '', ...details, ...(message ? ['', message] : [])].join('\n');
    const subject = `${titre}${vehicule ? ' · ' + vehicule : ''}`;
    preview.value = `À : ${TO}\nObjet : ${subject}\n\n${body}`;
    location.href = `mailto:${TO}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    form.hidden = true;
    success.hidden = false;
    success.focus();
  });

  document.querySelector('[data-edit]').addEventListener('click', () => { success.hidden = true; form.hidden = false; form.nom.focus(); });
  document.querySelector('[data-copy-preview]').addEventListener('click', async (e) => {
    try { await navigator.clipboard.writeText(preview.value); e.target.textContent = 'Copié'; }
    catch { preview.select(); e.target.textContent = 'Texte sélectionné'; }
    setTimeout(() => { e.target.textContent = 'Copier le message'; }, 1800);
  });
})();
