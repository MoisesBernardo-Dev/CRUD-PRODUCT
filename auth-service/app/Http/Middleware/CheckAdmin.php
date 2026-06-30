<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class CheckAdmin
{
    public function handle(Request $request, Closure $next): Response
    {
        // Pega o utilizador autenticado através do guard 'api' do JWT
        $user = Auth::guard('api')->user();

        // Verifica se o utilizador existe e se possui a role de administrador
        if ($user && $user->role === 'admin') {
            return $next($request);
        }

        return response()->json(['error' => 'Forbidden. Admin access required.'], 403);
    }
}
