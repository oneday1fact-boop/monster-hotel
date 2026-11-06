import { test as base } from '@playwright/test';
export { expect, type Page } from '@playwright/test';
/** Cloud workers have no physical GPU. Optional Canvas2D exercises the supported fallback without software-WebGL overhead. */
export const test = base.extend({ page: async ({ page }, use) => { if (process.env.MONSTER_SOFTWARE_TEST === '1')
        await page.addInitScript(() => { const get = HTMLCanvasElement.prototype.getContext; HTMLCanvasElement.prototype.getContext = function (type: string, ...args: any[]) { return type.includes('webgl') ? null : (get as any).call(this, type, ...args); }; }); await use(page); } });
