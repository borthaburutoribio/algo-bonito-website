// Algo Bonito — entradas, menú móvil, "Armá tu look" → WhatsApp, botón fijo y compartir.
document.documentElement.classList.add('js');
const WA = '5492983654144';
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Entradas escalonadas por sección (y la foto grande del hero se abre como persiana) */
const rise = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (!e.isIntersecting) return;
    e.target.classList.add('is-in');
    rise.unobserve(e.target);
  });
}, { rootMargin: '0px 0px -6% 0px' });
document.querySelectorAll('section, footer').forEach((sec) => {
  sec.querySelectorAll('[data-rise]').forEach((el, i) => {
    el.style.setProperty('--d', `${Math.min(i, 7) * 75}ms`);
    rise.observe(el);
  });
});
document.querySelectorAll('.shutter').forEach((el) => rise.observe(el));

/* Menú móvil */
const menuBtn = document.querySelector('.bar__menu');
const menu = document.getElementById('menu');
menuBtn.addEventListener('click', () => {
  const open = menu.classList.toggle('is-open');
  menuBtn.setAttribute('aria-expanded', String(open));
  menuBtn.textContent = open ? 'Cerrar' : 'Menú';
});
menu.addEventListener('click', (e) => {
  if (!e.target.closest('a')) return;
  menu.classList.remove('is-open');
  menuBtn.setAttribute('aria-expanded', 'false');
  menuBtn.textContent = 'Menú';
});

/* Armá tu look: arriba + jean + talle + retiro/envío → mensaje de WhatsApp */
const form = document.getElementById('look-form');
const board = document.querySelector('.look__board');
const imgTop = document.getElementById('look-top');
const imgBottom = document.getElementById('look-bottom');
const text = document.getElementById('look-text');
const cityWrap = document.getElementById('city-wrap');
let edited = false;

const swap = (img, name) => {
  const src = `assets/img/${name}.webp`;
  if (img.getAttribute('src') === src) return;
  if (reduce) { img.src = src; return; }
  img.classList.add('is-swapping');
  setTimeout(() => { img.src = src; img.onload = () => img.classList.remove('is-swapping'); }, 200);
};

const paint = (bump) => {
  const fd = new FormData(form);
  const top = form.querySelector('input[name="arriba"]:checked');
  const bottom = form.querySelector('input[name="abajo"]:checked');
  swap(imgTop, top.dataset.img);
  swap(imgBottom, bottom.dataset.img);
  const envio = fd.get('como') === 'envio';
  cityWrap.hidden = !envio;
  const talle = fd.get('talle') === 'no sé' ? 'no sé bien mi talle, ¿me ayudan?' : `talle ${fd.get('talle')}`;
  const ciudad = (fd.get('ciudad') || '').toString().trim();
  const donde = envio
    ? `Necesitaría envío${ciudad ? ` a ${ciudad}` : ''}. ¿Cuánto sale?`
    : 'Lo paso a buscar por Sarmiento 117.';
  if (!edited) text.value = `Hola Algo Bonito! Armé este look en la web: ${top.value} con ${bottom.value}, ${talle}. ¿Lo tienen? ${donde}`;
  if (bump && !reduce) { board.classList.remove('is-bump'); void board.offsetWidth; board.classList.add('is-bump'); }
};
form.addEventListener('input', (e) => { edited = false; paint(e.target.type === 'radio'); });
text.addEventListener('input', () => { edited = true; });
form.addEventListener('submit', (e) => {
  e.preventDefault();
  window.open(`https://wa.me/${WA}?text=${encodeURIComponent(text.value)}`, '_blank', 'noopener');
});
paint(false);

/* Botón fijo de WhatsApp: aparece después del hero, se esconde donde ya hay uno */
const fab = document.querySelector('.wa-fab');
const hideIn = new Set();
new IntersectionObserver((entries) => {
  entries.forEach((e) => (e.isIntersecting ? hideIn.add(e.target) : hideIn.delete(e.target)));
  fab.classList.toggle('is-hidden', hideIn.size > 0);
}).observe(document.querySelector('.look__board'));
const onScroll = () => fab.classList.toggle('is-shown', window.scrollY > window.innerHeight * 0.6);
window.addEventListener('scroll', () => requestAnimationFrame(onScroll), { passive: true });
onScroll();

/* Compartir */
document.querySelector('[data-share]').addEventListener('click', async (e) => {
  const data = { title: 'Algo Bonito', text: 'Ropa de mujer en Adolfo Gonzales Chaves', url: location.href };
  if (navigator.share) { try { await navigator.share(data); } catch (_) { /* cancelado */ } return; }
  try { await navigator.clipboard.writeText(location.href); e.target.textContent = 'Link copiado'; } catch (_) { /* sin portapapeles */ }
});
