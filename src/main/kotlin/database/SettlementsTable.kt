package database

import org.jetbrains.exposed.sql.Table
import org.jetbrains.exposed.sql.javatime.timestamp

object SettlementsTable : Table("settlements") {
    val id = long("id").autoIncrement()
    val groupId = long("group_id").references(GroupsTable.id)
    val payerId = long("payer_id").references(UsersTable.id)
    val payeeId = long("payee_id").references(UsersTable.id)
    val amount = decimal("amount", 12, 2)
    val createdAt = timestamp("created_at").nullable()

    override val primaryKey = PrimaryKey(id)
}