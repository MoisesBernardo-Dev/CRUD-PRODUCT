<?php

namespace Tests\Feature\Auth;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RegisterTest extends TestCase
{
    use RefreshDatabase; // Limpa o banco a cada teste

    public function test_a_user_can_register_successfully(): void
    {
        $payload = [
            'name' => 'Cliente Teste',
            'email' => 'cliente@teste.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ];

        $response = $this->postJson('/api/register', $payload);

        // Espera status 201 Created e estrutura JSON correta
        $response->assertStatus(201)
            ->assertJsonStructure([
                'user' => ['id', 'name', 'email'],
                'token'
            ]);

        // Garante que salvou no banco de dados
        $this->assertDatabaseHas('users', [
            'email' => 'cliente@teste.com'
        ]);
    }

    public function test_a_user_can_login_successfully(): void
    {
        // Cria um utilizador diretamente no banco de testes
        $user = \App\Models\User::create([
            'name' => 'Utilizador Login',
            'email' => 'login@teste.com',
            'password' => \Illuminate\Support\Facades\Hash::make('password123'),
            'role' => 'client'
        ]);

        $payload = [
            'email' => 'login@teste.com',
            'password' => 'password123',
        ];

        $response = $this->postJson('/api/login', $payload);

        $response->assertStatus(200)
            ->assertJsonStructure(['token', 'expires_in']);
    }

    public function test_a_user_can_logout_successfully(): void
    {
        $user = \App\Models\User::create([
            'name' => 'Utilizador Logout',
            'email' => 'logout@teste.com',
            'password' => \Illuminate\Support\Facades\Hash::make('password123'),
        ]);

        $token = \Tymon\JWTAuth\Facades\JWTAuth::fromUser($user);

        // Envia o token no Header Authorization Bearer
        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/logout');

        $response->assertStatus(200)
            ->assertJson(['message' => 'Successfully logged out']);
    }

    public function test_a_user_can_refresh_token_successfully(): void
    {
        $user = \App\Models\User::create([
            'name' => 'Utilizador Refresh',
            'email' => 'refresh@teste.com',
            'password' => \Illuminate\Support\Facades\Hash::make('password123'),
        ]);

        $token = \Tymon\JWTAuth\Facades\JWTAuth::fromUser($user);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/refresh');

        $response->assertStatus(200)
            ->assertJsonStructure(['token', 'expires_in']);
    }

    public function test_an_admin_can_see_the_total_count_of_users(): void
    {
        // Cria um administrador
        $admin = \App\Models\User::create([
            'name' => 'Dono do Sistema',
            'email' => 'admin@sistema.com',
            'password' => \Illuminate\Support\Facades\Hash::make('password123'),
            'role' => 'admin', // Role Admin
        ]);

        // Cria dois clientes comuns adicionais para contar no banco
        \App\Models\User::create([
            'name' => 'Cliente 1',
            'email' => 'c1@teste.com',
            'password' => '123',
            'role' => 'client'
        ]);
        \App\Models\User::create([
            'name' => 'Cliente 2',
            'email' => 'c2@teste.com',
            'password' => '123',
            'role' => 'client'
        ]);

        $token = \Tymon\JWTAuth\Facades\JWTAuth::fromUser($admin);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/users/count');

        // Espera-se sucesso e o valor correto (Total = 3 utilizadores criados neste teste)
        $response->assertStatus(200)
            ->assertJson(['total_users' => 3]);
    }

    public function test_a_client_cannot_see_the_total_count_of_users(): void
    {
        // Cria um cliente comum
        $client = \App\Models\User::create([
            'name' => 'Cliente Comum',
            'email' => 'clienteforadehora@teste.com',
            'password' => \Illuminate\Support\Facades\Hash::make('password123'),
            'role' => 'client', // Role Client
        ]);

        $token = \Tymon\JWTAuth\Facades\JWTAuth::fromUser($client);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/users/count');

        // Espera-se 403 Forbidden (Acesso Proibido)
        $response->assertStatus(403);
    }
}
