package repository

import database.SettlementsTable
import model.Settlement
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.transactions.transaction
import java.time.Instant
import kotlinx.coroutines.Dispatchers

class SettlementRepository {
    private suspend fun <T> dbQuery(block: () -> T): T =
        kotlinx.coroutines.withContext(Dispatchers.IO) {
            transaction { block() }
        }

    private fun rowToSettlement(row: ResultRow): Settlement {
        return Settlement(
            id = row[SettlementsTable.id],
            groupId = row[SettlementsTable.groupId],
            fromUserId = row[SettlementsTable.payerId], // Disesuaikan dengan model
            toUserId = row[SettlementsTable.payeeId],     // Disesuaikan dengan model
            amount = row[SettlementsTable.amount].toDouble(),
            createdAt = row[SettlementsTable.createdAt]?.toString()
        )
    }

    suspend fun create(groupId: Long, payerId: Long, payeeId: Long, amount: java.math.BigDecimal): Settlement? = dbQuery {
        val insertStatement = SettlementsTable.insert {
            it[SettlementsTable.groupId] = groupId
            it[SettlementsTable.payerId] = payerId
            it[SettlementsTable.payeeId] = payeeId
            it[SettlementsTable.amount] = amount
            it[SettlementsTable.createdAt] = Instant.now()
        }
        insertStatement.resultedValues?.singleOrNull()?.let { rowToSettlement(it) }
    }

    suspend fun getSettlementsByGroup(groupId: Long): List<Settlement> = dbQuery {
        SettlementsTable.selectAll().where { SettlementsTable.groupId eq groupId }
            .map { rowToSettlement(it) }
    }
}