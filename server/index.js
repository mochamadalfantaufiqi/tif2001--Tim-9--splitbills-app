// Kode backend dasar untuk menyimpan logika perhitungan split bill
function calculateSplitBill(totalAmount, totalPeople) {
    if (!totalAmount || !totalPeople || totalPeople <= 0) {
        return { error: "Input tidak valid" };
    }

    const sharePerPerson = totalAmount / totalPeople;

    return {
        totalAmount: totalAmount,
        totalPeople: totalPeople,
        sharePerPerson: sharePerPerson
    };
}

// Contoh penggunaan fungsi
const result = calculateSplitBill(150000, 3);
console.log("Hasil pembagian:", result);
