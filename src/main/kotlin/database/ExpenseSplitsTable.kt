package database

import org.jetbrains.exposed.sql.Table

object ExpenseSplitsTable : Table("expense_splits") {
    val id = long("id").autoIncrement()
    val expenseId = long("expense_id").references(ExpensesTable.id)
    val userId = long("user_id").references(UsersTable.id)
    val amount = decimal("amount", 12, 2)
    val isPaid = bool("is_paid").default(false)

    override val primaryKey = PrimaryKey(id)
}