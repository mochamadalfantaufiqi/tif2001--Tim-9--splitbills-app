'use strict';

/**
 * Bagi bilangan bulat `total` ke `n` bagian secara adil (largest-remainder).
 * Sisa rupiah (total % n) diberikan 1 per orang ke indeks pertama.
 * Jumlah semua bagian SELALU sama dengan total.
 *
 * @param {number} total  bilangan bulat >= 0
 * @param {number} n      bilangan bulat > 0
 * @returns {number[]}
 */
function splitEvenly(total, n) {
  if (!Number.isInteger(total) || total < 0) {
    throw new Error('total harus bilangan bulat >= 0');
  }
  if (!Number.isInteger(n) || n <= 0) {
    throw new Error('n harus bilangan bulat > 0');
  }
  const base = Math.floor(total / n);
  const remainder = total % n;
  return Array.from({ length: n }, (_, i) => base + (i < remainder ? 1 : 0));
}

/**
 * Bagi `total` secara proporsional terhadap array `weights`.
 * Sisa pembulatan dialokasikan dengan largest-remainder.
 *
 * @param {number}   total
 * @param {number[]} weights  subtotal per orang (bilangan bulat)
 * @returns {number[]}
 */
function splitProportionally(total, weights) {
  const sum = weights.reduce((a, b) => a + b, 0);
  if (sum === 0) {
    return splitEvenly(total, weights.length);
  }
  const raw = weights.map((w) => (total * w) / sum);
  const result = raw.map(Math.floor);
  let left = total - result.reduce((a, b) => a + b, 0);
  const order = raw
    .map((v, i) => ({ i, frac: v - Math.floor(v) }))
    .sort((a, b) => b.frac - a.frac || a.i - b.i);
  for (let k = 0; left > 0; k += 1, left -= 1) {
    result[order[k].i] += 1;
  }
  return result;
}

/**
 * Menghitung pembagian tagihan kafe (pajak dibagi rata ke semua peserta).
 *
 * @param {Object} bill
 * @param {Array<{id:string}>} bill.participants  urut sesuai sort_order
 * @param {Array<{id:string,price:number,qty:number,assigneeIds:string[]}>} bill.items
 * @param {'percent'|'nominal'} bill.taxMode
 * @param {number} bill.taxValue
 * @param {'percent'|'nominal'} [bill.serviceMode='percent']
 * @param {number}  [bill.serviceValue=0]
 * @param {'proportional'|'equal'} [bill.serviceSplit='proportional']
 * @returns {{ subtotal:number, taxTotal:number, serviceTotal:number, grandTotal:number,
 *             perPerson:Array }}
 */
function calculateSplit(bill) {
  const {
    participants,
    items,
    taxMode,
    taxValue,
    serviceMode = 'percent',
    serviceValue = 0,
    serviceSplit = 'proportional',
  } = bill;

  if (!participants.length) {
    throw new Error('Minimal 1 peserta');
  }

  const idx = new Map(participants.map((p, i) => [p.id, i]));
  const subtotals = participants.map(() => 0);

  // 1. Item dibagi hanya ke penanggung item
  items.forEach((item) => {
    if (!item.assigneeIds || !item.assigneeIds.length) {
      throw new Error(`Item ${item.id} belum punya penanggung`);
    }
    const itemTotal = item.price * item.qty;
    const shares = splitEvenly(itemTotal, item.assigneeIds.length);
    item.assigneeIds.forEach((pid, k) => {
      if (!idx.has(pid)) {
        throw new Error(`Peserta ${pid} tidak ada dalam daftar`);
      }
      subtotals[idx.get(pid)] += shares[k];
    });
  });

  const subtotalAll = subtotals.reduce((a, b) => a + b, 0);

  // 2. PAJAK dibagi RATA ke semua peserta (inti aplikasi)
  const taxTotal =
    taxMode === 'percent' ? Math.round((subtotalAll * taxValue) / 100) : Math.round(taxValue);
  const taxShares = splitEvenly(taxTotal, participants.length);

  // 3. Service charge (opsional)
  const serviceTotal =
    serviceMode === 'percent'
      ? Math.round((subtotalAll * serviceValue) / 100)
      : Math.round(serviceValue);
  const serviceShares =
    serviceSplit === 'equal'
      ? splitEvenly(serviceTotal, participants.length)
      : splitProportionally(serviceTotal, subtotals);

  const perPerson = participants.map((p, i) => ({
    participantId: p.id,
    name: p.name,
    subtotal: subtotals[i],
    tax: taxShares[i],
    service: serviceShares[i],
    total: subtotals[i] + taxShares[i] + serviceShares[i],
  }));

  return {
    subtotal: subtotalAll,
    taxTotal,
    serviceTotal,
    grandTotal: subtotalAll + taxTotal + serviceTotal,
    perPerson,
  };
}

module.exports = { splitEvenly, splitProportionally, calculateSplit };
