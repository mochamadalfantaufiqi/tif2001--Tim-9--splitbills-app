package com.splitbills

import io.ktor.server.application.*
import io.ktor.server.routing.*
import repository.UserRepository
import service.AuthService
import routes.authRoutes

fun Application.configureRouting() {
    routing {
        // Tambahkan baris ini di dalam blok routing
        val userRepository = UserRepository()
        val authService = AuthService(userRepository)
        authRoutes(authService)
    }
}