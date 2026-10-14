package repository

import database.UsersTable
import model.User
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.transactions.transaction
import java.time.Instant
import kotlinx.coroutines.Dispatchers

class UserRepository {
     //Fungsi pembantu untuk menjalankan transaksi database secara asinkron
    private suspend fun <T> dbQuery(block: () -> T): T =
        kotlinx.coroutines.withContext(Dispatchers.IO) {
            transaction { block() }
        }

    private fun rowToUser(row: ResultRow): User {
        return User(
            id = row[UsersTable.id],
            name = row[UsersTable.name],
            email = row[UsersTable.email],
            passwordHash = row[UsersTable.passwordHash],
            // Konversi Instant ke String jika model Anda menggunakan String, atau biarkan jika sudah Instant
            createdAt = row[UsersTable.createdAt]?.toString(),
            updatedAt = row[UsersTable.updatedAt]?.toString()
        )
    }

    suspend fun findById(id: Long): User? = dbQuery {
        UsersTable.selectAll().where { UsersTable.id eq id }
            .map { rowToUser(it) }
            .singleOrNull()
    }

    suspend fun findByEmail(email: String): User? = dbQuery {
        UsersTable.selectAll().where { UsersTable.email eq email }
            .map { rowToUser(it) }
            .singleOrNull()
    }

    suspend fun create(name: String, email: String, passwordHash: String): User? = dbQuery {
        val insertStatement = UsersTable.insert {
            it[UsersTable.name] = name
            it[UsersTable.email] = email
            it[UsersTable.passwordHash] = passwordHash
            it[UsersTable.createdAt] = Instant.now()
            it[UsersTable.updatedAt] = Instant.now()
        }
        insertStatement.resultedValues?.singleOrNull()?.let { rowToUser(it) }
    }
}