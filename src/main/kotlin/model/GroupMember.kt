package model

import kotlinx.serialization.Serializable

@Serializable
data class GroupMember(
    val id: Long,
    val groupId: Long,
    val userId: Long,
    val joinedAt: String? = null
)