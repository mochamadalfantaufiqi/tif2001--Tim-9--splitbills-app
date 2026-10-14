package model

import kotlinx.serialization.Serializable

@Serializable
data class ExpenseSplit(
    val id: Long,
    val expenseId: Long,
    val userId: Long,
    val amount: Double
)