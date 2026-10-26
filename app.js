/* The static time elements are generated from event.json. No network is required. */
function weddingState(now, start, end) {
  if (now >= end) return {message: 'Thank you for celebrating with us.'};
  if (now >= start) return {message: 'Today is our wedding day'};
  const total = Math.max(0, Math.floor((start - now) / 1000));
  return {days: Math.floor(total / 86400), hours: Math.floor(total / 3600) % 24, minutes: Math.floor(total / 60) % 60, seconds: total % 60};
}
if (typeof module !== 'undefined') module.exports = {weddingState};
if (typeof document !== 'undefined') {
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const intro = document.querySelector('#intro');
  const main = document.querySelector('#invitation');
  let opened = false, closeTimer;
  function finishIntro() {
    clearTimeout(closeTimer);
    if (intro.open) intro.close();
    intro.querySelector('.petals').replaceChildren();
    main.scrollIntoView({behavior:'instant'});
    main.focus({preventScroll:true});
  }
  document.querySelector('#open-invitation').addEventListener('click', event => {
    if (!intro.showModal) return;
    event.preventDefault();
    if (opened || motion.matches) {opened = true; finishIntro(); return;}
    opened = true;
    closeTimer = setTimeout(finishIntro, 6200);
    try {
      intro.showModal();
      intro.querySelector('img').loading = 'eager';
      for (let i=0;i<9;i++) {
        const petal = document.createElement('i');
        petal.style.left = (i*12)+'%';
        petal.style.animationDelay = (-i*.63)+'s';
        intro.querySelector('.petals').append(petal);
      }
      document.querySelector('#skip-intro').focus();
    } catch { finishIntro(); }
  });
  document.querySelector('#skip-intro').addEventListener('click',finishIntro);
  intro.addEventListener('cancel',event=>{event.preventDefault();finishIntro();});
  motion.addEventListener('change',()=>{if (motion.matches && intro.open) finishIntro();});
  const start = Date.parse(document.querySelector('#event-start').dateTime);
  const end = Date.parse(document.querySelector('#event-end').dateTime);
  let countdownTimer;
  function tick() {
    const state = weddingState(Date.now(),start,end);
    document.querySelector('#countdown-wrap').hidden = false;
    document.querySelector('.countdown').hidden = Boolean(state.message);
    document.querySelector('#countdown-label').hidden = Boolean(state.message);
    const message = document.querySelector('#event-message');
    message.hidden = !state.message;
    if (state.message) message.textContent = state.message;
    else for (const key of ['days','hours','minutes','seconds']) document.getElementById(key).textContent = key === 'days' ? state[key] : String(state[key]).padStart(2,'0');
    if (Date.now() >= end) clearInterval(countdownTimer);
  }
  function resume() {clearInterval(countdownTimer);tick();if (!document.hidden && Date.now()<end) countdownTimer=setInterval(tick,1000);}
  resume();
  document.addEventListener('visibilitychange',()=>{if(document.hidden){clearInterval(countdownTimer);if(intro.open) finishIntro();}else resume();});
  if ('IntersectionObserver' in window && !motion.matches) {
    const observer = new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('reveal');observer.unobserve(entry.target);}}),{threshold:.12});
    document.querySelectorAll('.portrait-frame,.date-display,.venue-panel,.closing').forEach(el=>observer.observe(el));
  }
}
