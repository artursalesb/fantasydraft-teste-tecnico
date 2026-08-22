<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\SessionController;
use App\Http\Controllers\PollController;


Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::post('/session', [SessionController::class, 'store']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/polls', [PollController::class, 'store']);
    Route::get('/polls/{poll}', [PollController::class, 'show']);
});