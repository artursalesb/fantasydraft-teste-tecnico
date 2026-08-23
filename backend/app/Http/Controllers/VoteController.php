<?php

namespace App\Http\Controllers;

use App\Models\Poll;
use App\Models\PollOption;
use App\Models\Vote;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Validation\ValidationException;

class VoteController extends Controller
{
    public function store(Request $request, Poll $poll)
    {
        if ($poll->closes_at !== null && now()->greaterThan($poll->closes_at)) {
           throw ValidationException::withMessages([
            'poll_option_id' => 'Essa enquete já foi encerrada.',
        ]);
    }
        $validated = $request->validate([
            'poll_option_id' => 'required|integer|exists:poll_options,id',
        ]);

        $option = PollOption::findOrFail($validated['poll_option_id']);

        if ($option->poll_id !== $poll->id) {
            throw ValidationException::withMessages([
                'poll_option_id' => 'Essa opção não pertence a essa enquete.',
            ]);
        }

        $alreadyVoted = Vote::where('poll_id', $poll->id)
            ->where('user_id', $request->user()->id)
            ->exists();

        if ($alreadyVoted) {
            throw ValidationException::withMessages([
                'poll_option_id' => 'Você já votou nessa enquete.',
            ]);
        }

        $vote = Vote::create([
            'poll_id' => $poll->id,
            'poll_option_id' => $option->id,
            'user_id' => $request->user()->id,
        ]);

        $this->notifyRealtimeServer($poll);

        return response()->json($vote, 201);
    }

    private function notifyRealtimeServer(Poll $poll): void
    {
        $poll->load(['options' => function ($query) {
            $query->withCount('votes');
        }]);

        try {
            Http::timeout(2)->post(
                config('services.realtime.url') . "/broadcast/{$poll->id}",
                $poll->toArray()
            );
        } catch (\Exception $e) {
            report($e);
        }
    }
}