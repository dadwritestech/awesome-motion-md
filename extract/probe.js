// Injected before any page script runs. Records every motion the page starts:
// CSS transitions and animations (via DOM events), Web Animations API calls
// (by wrapping Element.prototype.animate), every Animation object visible to
// document.getAnimations() (sampled), and inline-style mutations, which is
// where requestAnimationFrame libraries (GSAP, Framer Motion's JS path) show up.
(() => {
  if (window.__motion) return;
  const M = (window.__motion = {
    events: [],
    waapi: [],
    anims: [],
    styleMut: [],
    phase: 'load',
  });
  const ids = new WeakMap();
  let nextId = 1;
  const idOf = (el) => {
    if (!el || typeof el !== 'object') return 0;
    if (!ids.has(el)) ids.set(el, nextId++);
    return ids.get(el);
  };
  const describe = (el) => {
    if (!el || !el.tagName) return { sel: String(el && el.nodeName), id: 0 };
    let sel = el.tagName.toLowerCase();
    if (el.id) sel += '#' + el.id;
    const cls = typeof el.className === 'string' ? el.className.trim().split(/\s+/).filter(Boolean).slice(0, 2) : [];
    if (cls.length) sel += '.' + cls.join('.');
    const parent = el.parentElement;
    const index = parent ? Array.prototype.indexOf.call(parent.children, el) : 0;
    return { sel: sel.slice(0, 120), id: idOf(el), parent: idOf(parent), index };
  };
  M.describe = describe;
  M.idOf = idOf;
  const now = () => Math.round(performance.now());

  // Read the timing that applies to one transitioned property / one animation name
  // from computed style (lists cycle when shorter than the property list).
  const pick = (list, i) => {
    const parts = splitList(list);
    return parts.length ? parts[i % parts.length] : '';
  };
  const splitList = (s) => {
    const out = [];
    let depth = 0, cur = '';
    for (const ch of s || '') {
      if (ch === '(') depth++;
      if (ch === ')') depth--;
      if (ch === ',' && depth === 0) { out.push(cur.trim()); cur = ''; } else cur += ch;
    }
    if (cur.trim()) out.push(cur.trim());
    return out;
  };
  M.splitList = splitList;
  const secs = (s) => (s && s.endsWith('ms') ? parseFloat(s) : parseFloat(s) * 1000);

  document.addEventListener('transitionrun', (e) => {
    try {
      const cs = getComputedStyle(e.target);
      const props = splitList(cs.transitionProperty);
      let i = props.indexOf(e.propertyName);
      if (i < 0) i = props.indexOf('all');
      if (i < 0) i = 0;
      M.events.push({
        kind: 'transition', t: now(), phase: M.phase, prop: e.propertyName,
        declared: props[i] || '',
        duration: secs(pick(cs.transitionDuration, i)),
        delay: secs(pick(cs.transitionDelay, i)),
        easing: pick(cs.transitionTimingFunction, i),
        ...describe(e.target),
      });
    } catch (_) {}
  }, true);

  document.addEventListener('animationstart', (e) => {
    try {
      const cs = getComputedStyle(e.target);
      const names = splitList(cs.animationName);
      const i = Math.max(0, names.indexOf(e.animationName));
      M.events.push({
        kind: 'animation', t: now(), phase: M.phase, name: e.animationName,
        duration: secs(pick(cs.animationDuration, i)),
        delay: secs(pick(cs.animationDelay, i)),
        easing: pick(cs.animationTimingFunction, i),
        iterations: pick(cs.animationIterationCount, i),
        timeline: pick(cs.animationTimeline || 'auto', i),
        ...describe(e.target),
      });
    } catch (_) {}
  }, true);

  const origAnimate = Element.prototype.animate;
  Element.prototype.animate = function (keyframes, options) {
    try {
      const opts = typeof options === 'number' ? { duration: options } : options || {};
      let props = [];
      if (Array.isArray(keyframes)) keyframes.forEach((k) => props.push(...Object.keys(k || {})));
      else if (keyframes) props = Object.keys(keyframes);
      props = [...new Set(props.filter((p) => !['offset', 'easing', 'composite'].includes(p)))];
      if (M.waapi.length < 3000)
        M.waapi.push({
          t: now(), phase: M.phase, props,
          duration: typeof opts.duration === 'number' ? opts.duration : null,
          delay: opts.delay || 0,
          easing: opts.easing || (Array.isArray(keyframes) && keyframes[0] && keyframes[0].easing) || 'linear',
          iterations: opts.iterations ?? 1,
          timeline: opts.timeline ? opts.timeline.constructor.name : null,
          // The values (blur(10px), translateY(20%)) are what an agent needs to copy.
          keyframes: (() => { try { return JSON.stringify(keyframes).slice(0, 300); } catch (_) { return null; } })(),
          ...describe(this),
        });
    } catch (_) {}
    return origAnimate.apply(this, arguments);
  };

  // Sample document.getAnimations() so library-created and scroll-driven
  // animations are captured with their resolved timing, once each.
  const seen = new WeakSet();
  M.sample = () => {
    if (!document.getAnimations) return;
    for (const a of document.getAnimations()) {
      if (seen.has(a) || M.anims.length > 4000) continue;
      seen.add(a);
      try {
        const eff = a.effect;
        const timing = eff ? eff.getTiming() : {};
        let props = [], kfEasing = [];
        try {
          for (const k of eff.getKeyframes()) {
            props.push(...Object.keys(k).filter((p) => !['offset', 'computedOffset', 'easing', 'composite'].includes(p)));
            if (k.easing && k.easing !== 'linear') kfEasing.push(k.easing);
          }
        } catch (_) {}
        M.anims.push({
          t: now(), phase: M.phase, type: a.constructor.name,
          name: a.animationName || a.transitionProperty || a.id || '',
          duration: typeof timing.duration === 'number' ? timing.duration : null,
          delay: timing.delay || 0,
          easing: timing.easing,
          kfEasing: [...new Set(kfEasing)].slice(0, 3),
          iterations: timing.iterations,
          props: [...new Set(props)].slice(0, 8),
          timeline: a.timeline ? a.timeline.constructor.name : null,
          ...describe(eff && eff.target),
        });
      } catch (_) {}
    }
  };
  setInterval(M.sample, 50);

  // Inline style writes per frame are how rAF-driven libraries animate.
  const startObserver = () => {
    const mo = new MutationObserver((list) => {
      if (M.styleMut.length > 20000) return;
      const t = now();
      for (const m of list) {
        const el = m.target;
        if (!el.style) continue;
        M.styleMut.push({
          t, phase: M.phase, id: idOf(el), parent: idOf(el.parentElement),
          opacity: el.style.opacity, transform: el.style.transform.slice(0, 120),
        });
      }
    });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['style'], subtree: true });
  };
  if (document.documentElement) startObserver();
  else document.addEventListener('DOMContentLoaded', startObserver);
})();
