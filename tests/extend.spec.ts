import { test, expect } from '@playwright/test';

test('extend', async ({ page }) => {
  const account_id = process.env.ACCOUNT_ID ?? '';
  const password = process.env.PASSWORD ?? '';

  let nextRunTime: Date;

  await page.goto('https://secure.xserver.ne.jp/xapanel/login/xmgame/');
  await page.getByRole('textbox', { name: 'XServerアカウントID または メールアドレス' }).fill(account_id);
  await page.locator('#user_password').fill(password);
  await page.getByRole('button', { name: 'ログインする' }).click();
  await page.getByRole('link', { name: 'ゲーム管理' }).click();
  await page.getByRole('link', { name: 'アップグレード・期限延長' }).click();
  await page.waitForLoadState('domcontentloaded');
  const locator = page.getByRole('link', { name: '期限を延長する' });
  if ((await locator.count()) > 0) {
    // 期限延長可能な場合
    await locator.click();
    await page.getByRole('button', { name: '確認画面に進む' }).click();
    await page.getByRole('button', { name: '期限を延長する' }).click();
    await expect(page.getByText('期限を延長しました。')).toBeVisible();

    // 7時間後に次回実行
    nextRunTime = new Date(Date.now() + 7 * 60 * 60 * 1000);
    console.log('NEXT_RUN_TIME=' + nextRunTime.toISOString());
    console.log('NEXT_RUN_MINUTES=420');
    console.log('EXTEND_STATUS=success');
  } else {
    // 期限延長不可の場合
    await expect(page.getByText('期限の延長は行えません。')).toBeVisible();

    // 次回実行可能時刻を取得
    const messageElement = page.locator('.freePlanMessage');
    const messageText = await messageElement.textContent();

    // 日時を抽出 (例: 2025-07-10 06:05)
    const dateMatch = messageText?.match(/(\d{4}-\d{2}-\d{2} \d{2}:\d{2})/);

    if (dateMatch) {
      // JST時刻として解釈（+09:00を追加）
      const suggestedTime = new Date(dateMatch[1] + '+09:00');
      // 提案時刻の10分後に設定
      nextRunTime = new Date(suggestedTime.getTime() + 10 * 60 * 1000);

      // 現在時刻から次回実行までの分数を計算
      const minutesUntilNextRun = Math.ceil((nextRunTime.getTime() - Date.now()) / (60 * 1000));

      console.log('NEXT_RUN_TIME=' + nextRunTime.toISOString());
      console.log('NEXT_RUN_MINUTES=' + minutesUntilNextRun);
      console.log('EXTEND_STATUS=waiting');
      console.log('SUGGESTED_TIME=' + suggestedTime.toISOString());
    } else {
      // 時刻が取得できない場合は1時間後
      nextRunTime = new Date(Date.now() + 60 * 60 * 1000);
      console.log('NEXT_RUN_TIME=' + nextRunTime.toISOString());
      console.log('NEXT_RUN_MINUTES=60');
      console.log('EXTEND_STATUS=error');
    }
  }
});
