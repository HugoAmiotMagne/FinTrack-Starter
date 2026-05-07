export class TransactionForm {
  constructor(page) {
    this.page = page;
  }

  async open() {
    await this.page.getByRole('button', { name: 'Ajouter une transaction' }).click();
  }

  async fill({ label, amount, type, category }) {
    await this.page.getByLabel('Libellé').fill(label);
    await this.page.getByLabel('Montant').fill(String(amount));
    if (type) await this.page.getByLabel('Type').selectOption(type);
    if (category) await this.page.getByLabel('Catégorie').selectOption(category);
  }

  async submit() {
    await this.page.getByRole('button', { name: 'Valider' }).click();
  }
}
