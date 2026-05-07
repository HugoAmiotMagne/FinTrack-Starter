import { test, expect } from '@playwright/test';
import { TransactionForm } from './pages/transaction-form.js';

test('ajouter une transaction et la voir apparaître dans la liste', async ({ page }) => {
  await page.goto('/');
  const form = new TransactionForm(page);

  await form.open();
  await form.fill({ label: 'Café', amount: '3.50', category: 'alimentation' });
  await form.submit();

  const newTx = page
    .getByTestId('transaction-list')
    .getByRole('listitem')
    .filter({ hasText: 'Café' });
  await expect(newTx.getByText('Café')).toBeVisible();
  await expect(newTx.getByText(/3\.50/)).toBeVisible();
  await expect(newTx.getByText('alimentation')).toBeVisible();
});

test("le solde se met à jour après ajout d'une transaction crédit", async ({ page }) => {
  await page.goto('/');

  const balanceEl = page.locator('.card-balance .card-value');
  const balanceBefore = parseFloat((await balanceEl.textContent()).replace(/[^\d.-]/g, ''));

  const form = new TransactionForm(page);
  await form.open();
  await form.fill({ label: 'Virement test', amount: '100', type: 'credit' });
  await form.submit();

  const balanceAfter = parseFloat((await balanceEl.textContent()).replace(/[^\d.-]/g, ''));
  expect(balanceAfter).toBeCloseTo(balanceBefore + 100, 2);
});

test("le solde diminue après ajout d'une transaction débit", async ({ page }) => {
  await page.goto('/');

  const balanceEl = page.locator('.card-balance .card-value');
  const balanceBefore = parseFloat((await balanceEl.textContent()).replace(/[^\d.-]/g, ''));

  const form = new TransactionForm(page);
  await form.open();
  await form.fill({ label: 'Achat test', amount: '50', type: 'debit' });
  await form.submit();

  const balanceAfter = parseFloat((await balanceEl.textContent()).replace(/[^\d.-]/g, ''));
  expect(balanceAfter).toBeCloseTo(balanceBefore - 50, 2);
});
