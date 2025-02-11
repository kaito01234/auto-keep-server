import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  const MAX_RETRY = Number(process.env.MAX_RETRY) ?? 3;
  const account_id = process.env.ACCOUNT_ID ?? '';
  const password = process.env.PASSWORD ?? '';

  await page.goto('https://secure.xserver.ne.jp/xapanel/login/xmgame/');
  await page.getByRole('textbox', { name: 'XServerアカウントID または メールアドレス' }).fill(account_id);
  await page.locator('#user_password').fill(password);
  await page.getByRole('button', { name: 'ログインする' }).click();
  await page.getByRole('link', { name: 'ゲーム管理' }).click();

  for (let count = 0; count < MAX_RETRY; count++) {
    await page.getByRole('link', { name: 'ゲームパネル' }).click();
    await page.getByRole('link', { name: 'アップグレード・期限延長' }).click();
    const locator = page.getByRole('link', { name: '期限を延長する' });
    if ((await locator.count()) > 0) {
      await locator.click();
      await page.getByRole('combobox').selectOption('72');
      await page.getByRole('button', { name: '確認画面に進む' }).click();
      await page.getByRole('button', { name: '期限を延長する' }).click();
    } else {
      break;
    }
  }
});
