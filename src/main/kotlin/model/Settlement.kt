package model

import kotlinx.serialization.Serializable

@Serializable
data class Settlement(
    val id: Long,
    val groupId: Long,
    val fromUserId: Long,
    val toUserId: Long,
    val amount: Double,
    val createdAt: String? = null
)