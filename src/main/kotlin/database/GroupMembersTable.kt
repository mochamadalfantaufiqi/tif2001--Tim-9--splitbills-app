package database

import org.jetbrains.exposed.sql.Table
import org.jetbrains.exposed.sql.javatime.timestamp

object GroupMembersTable : Table("group_members") {
    val id = long("id").autoIncrement()
    val groupId = long("group_id").references(GroupsTable.id)
    val userId = long("user_id").references(UsersTable.id)
    val joinedAt = timestamp("joined_at").nullable()

    override val primaryKey = PrimaryKey(id)
}