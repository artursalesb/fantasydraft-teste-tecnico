<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class SessionController extends Controller
{
    public function store(Request $request)
    {
        $user = User::create([
            'name' => 'Anônimo ' . Str::random(6),
            'email' => Str::uuid() . '@anonimo.local',
            'password' => bcrypt(Str::random(32)),
        ]);

        $token = $user->createToken('poll-session')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user_id' => $user->id,
        ]);
    }
}