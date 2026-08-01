export function formatBigNumbers(amount: number): string {
  const quantifiers: [number, string][] = [
    [1e9, 'B'],
    [1e6, 'M'],
    [1e3, 'k'],
  ];

  for (const [denominator, letter] of quantifiers) {
    if (amount >= denominator) {
      return `${(amount / denominator).toFixed(2)}${letter}`;
    }
  }

  return amount.toFixed(2);
}

export function formatSharePrice(price: number): string {
  return `$${(price / 100).toFixed(2)} / share`;
}

