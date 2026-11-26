package database

import org.jetbrains.exposed.sql.Table
import org.jetbrains.exposed.sql.javatime.timestamp

object ExpensesTable : Table("expenses") {
    val id = long("id").autoIncrement()
    val groupId = long("group_id").references(GroupsTable.id)
    val paidBy = long("paid_by").references(UsersTable.id)
    val amount = decimal("amount", 12, 2)
    val description = text("description").nullable()
    val createdAt = timestamp("created_at").nullable()

    override val primaryKey = PrimaryKey(id)
}