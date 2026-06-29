<?php

namespace Tests\Feature\Product;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class ProductCrudTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_user_can_create_a_product_with_valid_jwt(): void
    {
        // Simula uma resposta HTTP que o auth-service daria se o token fosse válido
        Http::fake([
            'http://localhost:8000/api/me' => Http::response([
                'id' => 99, // ID fictício do cliente autenticado
                'name' => 'Cliente Logado',
                'email' => 'cliente@logado.com'
            ], 200)
        ]);

        $payload = [
            'name' => 'Notebook Gamer',
            'description' => '16GB RAM SSD 512GB',
            'price' => 4500.00,
            'stock' => 10
        ];

        // Enviamos um token fictício no cabeçalho
        $response = $this->withHeader('Authorization', 'Bearer token_valido_ficticio')
            ->postJson('/api/products', $payload);

        // Espera-se que retorne 201 Created e o produto contenha o user_id do cliente dono
        $response->assertStatus(201)
            ->assertJsonFragment([
                'user_id' => 99,
                'name' => 'Notebook Gamer'
            ]);

        // Garante que o registro foi salvo no banco de produtos com o respectivo dono
        $this->assertDatabaseHas('products', [
            'user_id' => 99,
            'name' => 'Notebook Gamer'
        ]);
    }

    public function test_a_user_can_only_list_their_own_products(): void
    {
        // Simula o utilizador ID 99 autenticado
        Http::fake([
            'http://localhost:8000/api/me' => Http::response(['id' => 99, 'name' => 'Cliente 99'], 200)
        ]);

        // Cria um produto do utilizador 99 e outro do utilizador 100
        \App\Models\Product::create(['user_id' => 99, 'name' => 'Meu Produto', 'price' => 10, 'stock' => 5]);
        \App\Models\Product::create(['user_id' => 100, 'name' => 'Produto de Outro', 'price' => 20, 'stock' => 2]);

        $response = $this->withHeader('Authorization', 'Bearer token')
            ->getJson('/api/products');

        $response->assertStatus(200)
            ->assertJsonCount(1) // Garante que só veio 1 produto na lista
            ->assertJsonFragment(['name' => 'Meu Produto'])
            ->assertJsonMissing(['name' => 'Produto de Outro']); // Bloqueia o do outro cliente
    }

    public function test_a_user_can_view_their_own_single_product(): void
    {
        Http::fake([
            'http://localhost:8000/api/me' => Http::response(['id' => 99], 200)
        ]);

        $product = \App\Models\Product::create(['user_id' => 99, 'name' => 'Produto X', 'price' => 50, 'stock' => 1]);

        $response = $this->withHeader('Authorization', 'Bearer token')
            ->getJson("/api/products/{$product->id}");

        $response->assertStatus(200)
            ->assertJsonFragment(['name' => 'Produto X']);
    }

    public function test_a_user_cannot_update_another_users_product(): void
    {
        Http::fake([
            'http://localhost:8000/api/me' => Http::response(['id' => 99], 200)
        ]);

        // Produto pertence ao ID 100
        $product = \App\Models\Product::create(['user_id' => 100, 'name' => 'Produto Original', 'price' => 50, 'stock' => 1]);

        $response = $this->withHeader('Authorization', 'Bearer token')
            ->putJson("/api/products/{$product->id}", [
                'name' => 'Nome Alterado',
                'price' => 60,
                'stock' => 2
            ]);

        // Espera-se 403 Forbidden ou 404 Not Found para ocultar a existência
        $response->assertStatus(403);
    }

    public function test_a_user_can_delete_their_own_product(): void
    {
        Http::fake([
            'http://localhost:8000/api/me' => Http::response(['id' => 99], 200)
        ]);

        $product = \App\Models\Product::create(['user_id' => 99, 'name' => 'Deletar Me', 'price' => 50, 'stock' => 1]);

        $response = $this->withHeader('Authorization', 'Bearer token')
            ->deleteJson("/api/products/{$product->id}");

        $response->assertStatus(204); // No content
        $this->assertDatabaseMissing('products', ['id' => $product->id]);
    }
}
