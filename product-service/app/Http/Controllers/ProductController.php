<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->input('auth_user');

        $products = Product::where('user_id', $user['id'])->get();

        return response()->json($products, 200);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $user = $request->input('auth_user');

        $product = Product::create([
            'user_id' => $user['id'],
            'name' => $request->name,
            'description' => $request->description,
            'price' => $request->price,
            'stock' => $request->stock,
        ]);

        return response()->json($product, 201);
    }

    public function show(Request $request, int $id)
    {
        $user = $request->input('auth_user');
        $product = Product::findOrFail($id);

        if ($product->user_id !== $user['id']) {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        return response()->json($product, 200);
    }

    public function update(Request $request, int $id)
    {
        $product = Product::findOrFail($id);
        $user = $request->input('auth_user');

        if ($product->user_id !== $user['id']) {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $product->update($request->all());

        return response()->json($product, 200);
    }

    public function destroy(Request $request, int $id)
    {
        $product = Product::findOrFail($id);
        $user = $request->input('auth_user');

        if ($product->user_id !== $user['id']) {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        $product->delete();

        return response()->json(null, 204);
    }
}
