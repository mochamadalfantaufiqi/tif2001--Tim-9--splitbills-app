package repository

import database.ExpensesTable
import database.ExpenseSplitsTable
import model.Expense
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.transactions.transaction
import java.time.Instant
import kotlinx.coroutines.Dispatchers

class ExpenseRepository {
    private suspend fun <T> dbQuery(block: () -> T): T =
        kotlinx.coroutines.withContext(Dispatchers.IO) {
            transaction { block() }
        }

    private fun rowToExpense(row: ResultRow): Expense {
        return Expense(
            id = row[ExpensesTable.id],
            groupId = row[ExpensesTable.groupId],
            paidBy = row[ExpensesTable.paidBy],
            totalAmount = row[ExpensesTable.amount].toDouble(),
            title = row[ExpensesTable.description] ?: "",
            createdAt = row[ExpensesTable.createdAt]?.toString()
        )
    }

    suspend fun findById(id: Long): Expense? = dbQuery {
        ExpensesTable.selectAll().where { ExpensesTable.id eq id }
            .map { rowToExpense(it) }
            .singleOrNull()
    }

    suspend fun create(groupId: Long, paidBy: Long, amount: java.math.BigDecimal, description: String?): Expense? = dbQuery {
        val insertStatement = ExpensesTable.insert {
            it[ExpensesTable.groupId] = groupId
            it[ExpensesTable.paidBy] = paidBy
            it[ExpensesTable.amount] = amount
            it[ExpensesTable.description] = description
            it[ExpensesTable.createdAt] = Instant.now()
        }
        insertStatement.resultedValues?.singleOrNull()?.let { rowToExpense(it) }
    }
}