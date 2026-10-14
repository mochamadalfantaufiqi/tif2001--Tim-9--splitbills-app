package repository

import database.GroupsTable
import database.GroupMembersTable
import model.Group
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.transactions.transaction
import java.time.Instant
import kotlinx.coroutines.Dispatchers

class GroupRepository {
    private suspend fun <T> dbQuery(block: () -> T): T =
        kotlinx.coroutines.withContext(Dispatchers.IO) {
            transaction { block() }
        }

    private fun rowToGroup(row: ResultRow): Group {
        return Group(
            id = row[GroupsTable.id],
            name = row[GroupsTable.name],
            description = row[GroupsTable.description],
            createdBy = row[GroupsTable.createdBy],
            createdAt = row[GroupsTable.createdAt]?.toString()
        )
    }

    suspend fun findById(id: Long): Group? = dbQuery {
        GroupsTable.selectAll().where { GroupsTable.id eq id }
            .map { rowToGroup(it) }
            .singleOrNull()
    }

    suspend fun create(name: String, description: String?, createdBy: Long): Group? = dbQuery {
        val insertStatement = GroupsTable.insert {
            it[GroupsTable.name] = name
            it[GroupsTable.description] = description
            it[GroupsTable.createdBy] = createdBy
            it[GroupsTable.createdAt] = Instant.now()
        }
        insertStatement.resultedValues?.singleOrNull()?.let { rowToGroup(it) }
    }
}