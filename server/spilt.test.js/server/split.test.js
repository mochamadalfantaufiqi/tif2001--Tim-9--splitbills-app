// Contoh unit test logika bisnis split bill
function calculateSplit(total, people) {
  if (people <= 0) return 0;
  return total / people;
}

describe('Unit Test Logika Bisnis Split Bill', () => {
  test('Harus membagi total tagihan secara merata', () => {
    const result = calculateSplit(100000, 2);
    expect(result).toBe(50000);
  });

  test('Harus mengembalikan 0 jika jumlah orang kurang dari atau sama dengan 0', () => {
    const result = calculateSplit(100000, 0);
    expect(result).toBe(0);
  });
});
