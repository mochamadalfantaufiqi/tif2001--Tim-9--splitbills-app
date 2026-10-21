package database

import org.jetbrains.exposed.sql.Table
import org.jetbrains.exposed.sql.javatime.timestamp

object GroupsTable : Table("groups") {
    val id = long("id").autoIncrement()
    val name = varchar("name", 255)
    val description = text("description").nullable()
    val createdBy = long("created_by").references(UsersTable.id)
    val createdAt = timestamp("created_at").nullable()
    val updatedAt = timestamp("updated_at").nullable()

    override val primaryKey = PrimaryKey(id)
}