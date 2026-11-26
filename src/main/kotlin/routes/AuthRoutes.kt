package routes

import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import dto.UserRegisterRequest
import dto.UserLoginRequest
import service.AuthService

fun Route.authRoutes(authService: AuthService) {
    route("/api/v1/auth") {

        // Endpoint Register
        post("/register") {
            try {
                val request = call.receive<UserRegisterRequest>()
                val user = authService.register(request.name, request.email, request.password)

                if (user != null) {
                    call.respond(HttpStatusCode.Created, mapOf("message" to "Registrasi berhasil", "userId" to user.id))
                } else {
                    call.respond(HttpStatusCode.BadRequest, mapOf("error" to "Gagal mendaftarkan pengguna"))
                }
            } catch (e: IllegalArgumentException) {
                call.respond(HttpStatusCode.Conflict, mapOf("error" to (e.message ?: "Email sudah terdaftar")))
            } catch (e: Exception) {
                call.respond(HttpStatusCode.InternalServerError, mapOf("error" to "Terjadi kesalahan pada server: ${e.localizedMessage}"))
            }
        }

        // Endpoint Login
        post("/login") {
            try {
                val request = call.receive<UserLoginRequest>()
                val user = authService.login(request.email, request.password)

                if (user != null) {
                    // Sementara kita kirim respons sukses login (nanti bisa ditambahkan token JWT di sini)
                    call.respond(HttpStatusCode.OK, mapOf(
                        "message" to "Login berhasil",
                        "userId" to user.id,
                        "name" to user.name,
                        "email" to user.email
                    ))
                } else {
                    call.respond(HttpStatusCode.Unauthorized, mapOf("error" to "Email atau password salah"))
                }
            } catch (e: Exception) {
                call.respond(HttpStatusCode.InternalServerError, mapOf("error" to "Terjadi kesalahan pada server: ${e.localizedMessage}"))
            }
        }
    }
}