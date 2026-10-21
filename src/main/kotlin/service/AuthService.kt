package service

import model.User
import repository.UserRepository
import org.mindrot.jbcrypt.BCrypt

class AuthService(private val userRepository: UserRepository) {

    // Proses Registrasi Pengguna Baru
    suspend fun register(name: String, email: String, plainPassword: String): User? {
        // Cek apakah email sudah terdaftar
        val existingUser = userRepository.findByEmail(email)
        if (existingUser != null) {
            return null // Email sudah digunakan
        }

        // Hash password menggunakan BCrypt sebelum disimpan ke database
        val passwordHash = BCrypt.hashpw(plainPassword, BCrypt.gensalt())

        // Simpan ke database melalui UserRepository
        return userRepository.create(name, email, passwordHash)
    }

    // Proses Login Pengguna
    suspend fun login(email: String, plainPassword: String): User? {
        val user = userRepository.findByEmail(email) ?: return null

        // Verifikasi password dengan hash yang ada di database
        val isPasswordValid = BCrypt.checkpw(plainPassword, user.passwordHash)
        if (!isPasswordValid) {
            return null
        }

        return user
    }
}