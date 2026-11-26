'use strict';

const { splitEvenly, splitProportionally, calculateSplit } = require('../../src/utils/splitCalculator');

// TC1 dari PDF: Andi 40k, Budi 25k, Cici 15k, pajak 10%
// Andi: 42667, Budi: 27667, Cici: 17666 | total: 88000

describe('splitEvenly', () => {
  test('membagi 8000 ke 3 orang → [2667, 2667, 2666]', () => {
    expect(splitEvenly(8000, 3)).toEqual([2667, 2667, 2666]);
  });

  test('membagi 10 ke 3 orang → [4,3,3]', () => {
    expect(splitEvenly(10, 3)).toEqual([4, 3, 3]);
  });

  test('membagi 0 ke 2 orang → [0,0]', () => {
    expect(splitEvenly(0, 2)).toEqual([0, 0]);
  });

  test('membagi 100 ke 1 orang → [100]', () => {
    expect(splitEvenly(100, 1)).toEqual([100]);
  });

  test('jumlah selalu sama dengan total (invarian)', () => {
    const parts = splitEvenly(99999, 7);
    expect(parts.reduce((a, b) => a + b, 0)).toBe(99999);
  });

  test('error jika total bukan bilangan bulat', () => {
    expect(() => splitEvenly(10.5, 3)).toThrow();
  });

  test('error jika n <= 0', () => {
    expect(() => splitEvenly(10, 0)).toThrow();
  });
});

describe('splitProportionally', () => {
  test('proporsi 2:1:1 → [50,25,25] dari 100', () => {
    const result = splitProportionally(100, [2, 1, 1]);
    expect(result.reduce((a, b) => a + b, 0)).toBe(100);
  });

  test('semua bobot 0 → rata', () => {
    expect(splitProportionally(90, [0, 0, 0])).toEqual([30, 30, 30]);
  });
});

describe('calculateSplit – TC1 PDF', () => {
  const bill = {
    participants: [
      { id: 'p1', name: 'Andi' },
      { id: 'p2', name: 'Budi' },
      { id: 'p3', name: 'Cici' },
    ],
    items: [
      { id: 'i1', price: 40000, qty: 1, assigneeIds: ['p1'] },
      { id: 'i2', price: 25000, qty: 1, assigneeIds: ['p2'] },
      { id: 'i3', price: 15000, qty: 1, assigneeIds: ['p3'] },
    ],
    taxMode: 'percent',
    taxValue: 10,
    serviceMode: 'percent',
    serviceValue: 0,
    serviceSplit: 'proportional',
  };

  let result;
  beforeAll(() => { result = calculateSplit(bill); });

  test('subtotal = 80000', () => expect(result.subtotal).toBe(80000));
  test('taxTotal = 8000', () => expect(result.taxTotal).toBe(8000));
  test('grandTotal = 88000', () => expect(result.grandTotal).toBe(88000));
  test('Andi total = 42667', () => expect(result.perPerson[0].total).toBe(42667));
  test('Budi total = 27667', () => expect(result.perPerson[1].total).toBe(27667));
  test('Cici total = 17666', () => expect(result.perPerson[2].total).toBe(17666));

  test('invarian: jumlah per orang = grandTotal', () => {
    const sum = result.perPerson.reduce((a, p) => a + p.total, 0);
    expect(sum).toBe(result.grandTotal);
  });
});

describe('calculateSplit – edge cases', () => {
  test('error jika participants kosong', () => {
    expect(() => calculateSplit({
      participants: [],
      items: [],
      taxMode: 'percent',
      taxValue: 10,
    })).toThrow('Minimal 1 peserta');
  });

  test('error jika item tanpa penanggung', () => {
    expect(() => calculateSplit({
      participants: [{ id: 'p1', name: 'Andi' }],
      items: [{ id: 'i1', price: 10000, qty: 1, assigneeIds: [] }],
      taxMode: 'percent',
      taxValue: 10,
    })).toThrow();
  });

  test('pajak nominal dipakai langsung', () => {
    const result = calculateSplit({
      participants: [{ id: 'p1', name: 'A' }, { id: 'p2', name: 'B' }],
      items: [{ id: 'i1', price: 10000, qty: 1, assigneeIds: ['p1', 'p2'] }],
      taxMode: 'nominal',
      taxValue: 2000,
    });
    expect(result.taxTotal).toBe(2000);
    expect(result.perPerson[0].tax + result.perPerson[1].tax).toBe(2000);
  });
});
