package repository

import database.ExpenseSplitsTable
import model.ExpenseSplit
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.transactions.transaction
import kotlinx.coroutines.Dispatchers

class ExpenseSplitRepository {
    private suspend fun <T> dbQuery(block: () -> T): T =
        kotlinx.coroutines.withContext(Dispatchers.IO) {
            transaction { block() }
        }

    private fun rowToExpenseSplit(row: ResultRow): ExpenseSplit {
        return ExpenseSplit(
            id = row[ExpenseSplitsTable.id],
            expenseId = row[ExpenseSplitsTable.expenseId],
            userId = row[ExpenseSplitsTable.userId],
            amount = row[ExpenseSplitsTable.amount].toDouble()
            // Sesuaikan properti status lunas di sini jika ada (misal: isPaid, paid, dll.)
        )
    }

    suspend fun create(expenseId: Long, userId: Long, amount: java.math.BigDecimal): ExpenseSplit? = dbQuery {
        val insertStatement = ExpenseSplitsTable.insert {
            it[ExpenseSplitsTable.expenseId] = expenseId
            it[ExpenseSplitsTable.userId] = userId
            it[ExpenseSplitsTable.amount] = amount
            it[ExpenseSplitsTable.isPaid] = false
        }
        insertStatement.resultedValues?.singleOrNull()?.let { rowToExpenseSplit(it) }
    }

    suspend fun getSplitsByExpense(expenseId: Long): List<ExpenseSplit> = dbQuery {
        ExpenseSplitsTable.selectAll().where { ExpenseSplitsTable.expenseId eq expenseId }
            .map { rowToExpenseSplit(it) }
    }

    suspend fun markAsPaid(splitId: Long): Boolean = dbQuery {
        ExpenseSplitsTable.update({ ExpenseSplitsTable.id eq splitId }) {
            it[isPaid] = true
        } > 0
    }
}