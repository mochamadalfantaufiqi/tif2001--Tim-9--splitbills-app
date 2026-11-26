package model

import kotlinx.serialization.Serializable

@Serializable
data class Expense(
    val id: Long,
    val groupId: Long,
    val paidBy: Long,
    val title: String,
    val totalAmount: Double,
    val createdAt: String? = null,
    val updatedAt: String? = null
)