export interface CsvMenuItem {
  code: string;
  name: string;
  category: string;
  price: number;
}

export function parseMenuCsv(csv: string): CsvMenuItem[] {
  const lines = csv.trim().split('\n');
  if (lines.length < 2) return [];

  const header = lines[0].split(',').map((h) => h.trim().toLowerCase());
  const codeIdx = header.indexOf('code');
  const nameIdx = header.indexOf('name');
  const categoryIdx = header.indexOf('category');
  const priceIdx = header.indexOf('price');

  if (codeIdx < 0 || nameIdx < 0 || categoryIdx < 0 || priceIdx < 0) {
    throw new Error('CSV must have columns: Code, Name, Category, Price');
  }

  const items: CsvMenuItem[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',').map((c) => c.trim());
    if (cols.length < 4) continue;
    const price = parseFloat(cols[priceIdx]);
    if (isNaN(price)) continue;
    items.push({
      code: cols[codeIdx],
      name: cols[nameIdx],
      category: cols[categoryIdx],
      price,
    });
  }
  return items;
}
