package model

import kotlinx.serialization.Serializable

@Serializable
data class User(
    val id: Long,
    val name: String,
    val email: String,
    val passwordHash: String,
    val createdAt: String? = null,
    val updatedAt: String? = null
)