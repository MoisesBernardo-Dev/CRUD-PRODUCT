<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use OpenApi\Attributes as OA; // Importação essencial para os atributos

#[OA\Info(
    version: "1.0.0",
    description: "Microserviço de Autenticação e Gestão de Clientes",
    title: "Auth Service API"
)]
#[OA\Server(
    url: "http://localhost:8000",
    description: "Servidor Local Auth"
)]

class AuthController extends Controller
{
    #[OA\Post(
        path: "/api/register",
        summary: "Registrar um novo cliente",
        responses: [
            new OA\Response(response: 201, description: "Cliente criado com sucesso"),
            new OA\Response(response: 422, description: "Erro de validação")
        ]
    )]
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'client',
        ]);

        // Usa o helper direto do JWTAuth que a IDE reconhece o retorno da String do Token
        $token = \Tymon\JWTAuth\Facades\JWTAuth::fromUser($user);

        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
            ],
            'token' => $token
        ], 201);
    }

    #[OA\Post(
        path: "/api/login",
        summary: "Autenticar um cliente / obter Token JWT",
        responses: [
            new OA\Response(response: 200, description: "Login efetuado com sucesso"),
            new OA\Response(response: 401, description: "Credenciais inválidas")
        ]
    )]
    public function login(Request $request)
    {
        $credentials = $request->only('email', 'password');

        // Usa a Facade Auth apontando para o guard 'api' do JWT
        if (!$token = Auth::guard('api')->attempt($credentials)) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        return response()->json([
            'token' => $token,
            'expires_in' => config('jwt.ttl') * 60 // Pega o tempo de expiração configurado de forma limpa
        ]);
    }

    
    public function logout()
    {
        // Usa a Facade do JWTAuth para invalidar o token atual explicitamente
        \Tymon\JWTAuth\Facades\JWTAuth::invalidate(\Tymon\JWTAuth\Facades\JWTAuth::getToken());

        return response()->json(['message' => 'Successfully logged out'], 200);
    }

    public function refresh()
    {
        // Usa a Facade do JWTAuth para fazer o refresh (a IDE reconhece perfeitamente)
        $newToken = \Tymon\JWTAuth\Facades\JWTAuth::refresh(\Tymon\JWTAuth\Facades\JWTAuth::getToken());

        return response()->json([
            'token' => $newToken,
            'expires_in' => config('jwt.ttl') * 60
        ], 200);
    }

    public function userCount()
    {
        // Conta todos os registros da tabela de usuários
        $count = User::where('role', 'client')->count();

        return response()->json([
            'total_users' => $count
        ], 200);
    }

    public function me()
    {
        // Retorna os dados do utilizador dono do token JWT enviado na requisição
        return response()->json(Auth::guard('api')->user(), 200);
    }
}
