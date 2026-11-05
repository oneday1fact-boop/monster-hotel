import { characters, type Locale } from '../i18n/catalog';
import { portrait } from './art';
/** First-night cast introduction, before the real queue arrival animation begins. */
export function arrivalIntroduction(locale: Locale, start: () => void) {
    const en = locale === 'en', root = document.createElement('div');
    root.className = 'arrival-introduction';
    const text = document.createElement('p');
    text.className = 'arrival-opening';
    text.textContent = en ? 'The hotel opens its doors for the first time. Four new guests arrive, each with a different room wish. Welcome them in!' : '旅館第一晚開門！四位新住客陸續到達，每位都有唔同嘅需要。幫佢哋安排第一晚啦！';
    root.append(text);
    const guests = document.createElement('div');
    guests.className = 'arrival-guests';
    for (const kind of ['werewolf', 'jiangshi', 'lantern', 'mummy'] as const) {
        const c = characters[locale][kind], card = document.createElement('article');
        card.className = 'arrival-guest';
        const image = portrait(kind);
        image.setAttribute('aria-label', c.name);
        const copy = document.createElement('div'), name = document.createElement('strong'), wish = document.createElement('p');
        name.textContent = c.name + ' · ' + c.species;
        wish.textContent = c.wish;
        copy.append(name, wish);
        card.append(image, copy);
        guests.append(card);
    }
    root.append(guests);
    const go = document.createElement('button');
    go.className = 'game-primary-button';
    go.dataset.action = 'welcome-guests';
    go.textContent = en ? 'Welcome our first guests' : '迎接第一批住客';
    go.onclick = start;
    root.append(go);
    return root;
}
