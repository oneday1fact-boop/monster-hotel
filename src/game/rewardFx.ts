import type { Locale } from '../i18n/catalog';
/** Presentation only: the domain has already awarded/saved this exact amount. */
export function celebrateReward(amount: number, balance: number, locale: Locale, cue: () => void = () => { }) {
    if (amount <= 0)
        return () => { };
    const root = document.createElement('div');
    root.className = 'reward-harvest';
    root.dataset.rewardAmount = String(amount);
    root.setAttribute('aria-hidden', 'true');
    root.setAttribute('aria-label', locale === 'en' ? `${amount} coins earned` : `獲得 ${amount} 金幣`);
    const wallet = document.createElement('div');
    wallet.className = 'harvest-wallet';
    wallet.innerHTML = '<span aria-hidden="true">✦</span>';
    const count = document.createElement('strong');
    count.textContent = String(balance - amount);
    count.dataset.harvestWallet = '';
    wallet.append(count);
    root.append(wallet);
    const text = document.createElement('div');
    text.className = 'harvest-banner';
    text.innerHTML = `<span>${locale === 'en' ? 'Wonderful check-in!' : '旅館大豐收！'}</span><strong>+${amount}</strong><small>${locale === 'en' ? 'Coins collected' : '金幣收好啦'}</small>`;
    root.append(text);
    document.body.append(root);
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches, animations: Animation[] = [];
    let frame = 0, disposed = false;
    const coinHTML = '<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="34" r="27" fill="#ac5a38"/><circle cx="32" cy="29" r="26" fill="#ffda66" stroke="#fff1ac" stroke-width="3"/><circle cx="32" cy="29" r="19" fill="#f8b93e" stroke="#d98a2b" stroke-width="2"/><path d="M32 12L37 23L49 25L40 33L42 46L32 39L21 46L24 33L15 25L27 23Z" fill="#fff0a3"/></svg>';
    const origin = { x: innerWidth * .48, y: innerHeight * .55 }, target = { x: innerWidth - 66, y: 91 };
    if (!reduced && typeof Element.prototype.animate === 'function') {
        for (let i = 0; i < 36; i++) {
            const coin = document.createElement('span');
            coin.className = 'harvest-coin';
            coin.innerHTML = coinHTML;
            coin.style.left = origin.x + 'px';
            coin.style.top = origin.y + 'px';
            root.append(coin);
            const angle = i * 2.39996, spread = Math.min(innerWidth, innerHeight) * (.19 + (i % 5) * .025), dx = Math.cos(angle) * spread, dy = Math.sin(angle) * spread * .65;
            animations.push(coin.animate([{ transform: 'translate(-50%,-50%) scale(.1) rotateY(0deg)', opacity: 0, offset: 0 }, { transform: `translate(calc(-50% + ${dx}px),calc(-50% + ${dy - 65}px)) scale(1.15) rotateY(180deg)`, opacity: 1, offset: .28 }, { transform: `translate(calc(-50% + ${dx}px),calc(-50% + ${dy + 15}px)) scale(1) rotateY(360deg)`, opacity: 1, offset: .6 }, { transform: `translate(calc(-50% + ${target.x - origin.x}px),calc(-50% + ${target.y - origin.y}px)) scale(.35) rotateY(720deg)`, opacity: 1, offset: .94 }, { transform: `translate(calc(-50% + ${target.x - origin.x}px),calc(-50% + ${target.y - origin.y}px)) scale(.15) rotateY(760deg)`, opacity: 0, offset: 1 }], { duration: 1800, delay: i * 18, easing: 'cubic-bezier(.22,.72,.2,1)', fill: 'both' }));
        }
        const began = performance.now();
        const tick = (now: number) => { if (disposed)
            return; const progress = Math.min(1, Math.max(0, (now - began - 850) / 1500)); count.textContent = String(balance - amount + Math.round(amount * (1 - (1 - progress) ** 3))); if (progress < 1)
            frame = requestAnimationFrame(tick); };
        frame = requestAnimationFrame(tick);
    }
    else {
        root.classList.add('is-reduced');
        count.textContent = String(balance);
    }
    cue();
    const cleanup = () => { if (disposed)
        return; disposed = true; cancelAnimationFrame(frame); animations.forEach(a => a.cancel()); root.remove(); };
    const timer = setTimeout(cleanup, reduced ? 1600 : 3300);
    return () => { clearTimeout(timer); cleanup(); };
}
