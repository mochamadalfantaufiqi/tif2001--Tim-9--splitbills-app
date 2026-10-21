package model

import kotlinx.serialization.Serializable

@Serializable
data class Group(
    val id: Long,
    val name: String,
    val description: String? = null,
    val createdBy: Long,
    val createdAt: String? = null,
    val updatedAt: String? = null
)