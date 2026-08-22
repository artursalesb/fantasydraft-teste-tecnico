<?php

namespace App\Http\Controllers;

use App\Models\Poll;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PollController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'question' => 'required|string|max:255',
            'options' => 'required|array|min:2',
            'options.*' => 'required|string|max:100',
        ]);

        $poll = DB::transaction(function () use ($validated, $request) {
            $poll = Poll::create([
                'question' => $validated['question'],
                'user_id' => $request->user()->id,
            ]);

            foreach ($validated['options'] as $optionText) {
                $poll->options()->create(['text' => $optionText]);
            }

            return $poll;
        });

        return response()->json(
            $poll->load('options'),
            201
        );
    }

    public function show(Poll $poll)
    {
        $poll->load(['options' => function ($query) {
            $query->withCount('votes');
        }]);

        return response()->json($poll);
    }
}