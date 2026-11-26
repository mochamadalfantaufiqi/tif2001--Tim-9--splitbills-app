package com.splitbills

import database.DatabaseFactory
import io.ktor.server.netty.EngineMain
import io.ktor.server.application.*
import io.ktor.server.routing.*
import repository.UserRepository
import routes.authRoutes
import service.AuthService

fun main(args: Array<String>) {
    EngineMain.main(args)
}

fun Application.module() {
    DatabaseFactory.init()

    // 1. Inisialisasi Repository dan Service
    val userRepository = UserRepository()
    val authService = AuthService(userRepository)

    // 2. Daftarkan routing Anda (bisa di dalam configureRouting() atau langsung di sini)
    routing {
        authRoutes(authService)
    }
}