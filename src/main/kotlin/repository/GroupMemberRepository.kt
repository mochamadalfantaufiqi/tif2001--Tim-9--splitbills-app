package repository

import database.GroupMembersTable
import database.UsersTable
import model.User
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.transactions.transaction
import kotlinx.coroutines.Dispatchers

class GroupMemberRepository {
    private suspend fun <T> dbQuery(block: () -> T): T =
        kotlinx.coroutines.withContext(Dispatchers.IO) {
            transaction { block() }
        }

    suspend fun addMember(groupId: Long, userId: Long): Boolean = dbQuery {
        val inserted = GroupMembersTable.insert {
            it[GroupMembersTable.groupId] = groupId
            it[GroupMembersTable.userId] = userId
        }.resultedValues?.singleOrNull() != null
        inserted
    }

    suspend fun getMembersByGroup(groupId: Long): List<User> = dbQuery {
        (UsersTable innerJoin GroupMembersTable)
            .selectAll()
            .where { GroupMembersTable.groupId eq groupId }
            .map {
                User(
                    id = it[UsersTable.id],
                    name = it[UsersTable.name],
                    email = it[UsersTable.email],
                    passwordHash = it[UsersTable.passwordHash],
                    createdAt = it[UsersTable.createdAt]?.toString(),
                    updatedAt = it[UsersTable.updatedAt]?.toString()
                )
            }
    }
}