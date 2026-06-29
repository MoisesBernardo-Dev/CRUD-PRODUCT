<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Symfony\Component\HttpFoundation\Response;

class AuthRemoteUser
{
    public function handle(Request $request, Closure $next): Response
    {
        $token = $request->bearerToken();

        if (!$token) {
            return response()->json(['error' => 'Token not provided.'], 401);
        }

        // Faz a chamada síncrona HTTP para o Auth Service
        $authServiceUrl = config('services.auth_service.url', 'http://localhost:8000/api') . '/me';
        
        $response = Http::withToken($token)->get($authServiceUrl);

        if ($response->failed()) {
            return response()->json(['error' => 'Unauthorized or invalid token.'], 401);
        }

        // Injeta os dados do utilizador validado dentro da requisição 
        // para que o Controller saiba quem é o dono da ação
        $request->merge(['auth_user' => $response->json()]);

        return $next($request);
    }
}
