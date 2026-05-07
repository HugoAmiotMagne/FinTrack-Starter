import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';

test('export CSV télécharge un fichier avec le bon nom', async ({ page }) => {
  await page.goto('/');

  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Exporter en CSV' }).click();
  const download = await downloadPromise;

  expect(download.suggestedFilename()).toMatch(/^fintrack-\d{4}-\d{2}\.csv$/);
});

test("le fichier CSV contient l'en-tête et les transactions du mois", async ({ page }) => {
  await page.goto('/');

  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Exporter en CSV' }).click();
  const download = await downloadPromise;

  const filePath = await download.path();
  const content = readFileSync(filePath, 'utf-8');

  expect(content).toContain('date,label,amount,category');
  // todayMinus(1) et todayMinus(2) sont toujours dans le mois courant
  expect(content).toContain('Coffee shop');
  expect(content).toContain('Courses Bio Cest Bon');
});

test('une transaction ajoutée apparaît dans le CSV exporté', async ({ page }) => {
  await page.goto('/');

  // Ajouter une nouvelle transaction via le formulaire
  await page.getByRole('button', { name: 'Ajouter une transaction' }).click();
  await page.getByLabel('Libellé').fill('Test export unique');
  await page.getByLabel('Montant').fill('42');
  await page.getByRole('button', { name: 'Valider' }).click();

  // Vérifier qu'elle figure dans le CSV
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Exporter en CSV' }).click();
  const download = await downloadPromise;

  const filePath = await download.path();
  const content = readFileSync(filePath, 'utf-8');
  expect(content).toContain('Test export unique');
});
