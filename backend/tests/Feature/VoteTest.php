<?php

namespace Tests\Feature;

use App\Models\Poll;
use App\Models\PollOption;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class VoteTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_cannot_vote_twice_on_same_poll(): void
    {
        $user = User::factory()->create();

        $poll = Poll::create([
            'question' => 'Pergunta de teste',
            'user_id' => $user->id,
        ]);

        $optionA = PollOption::create([
            'poll_id' => $poll->id,
            'text' => 'Opção A',
        ]);

        $optionB = PollOption::create([
            'poll_id' => $poll->id,
            'text' => 'Opção B',
        ]);

        $firstVote = $this->actingAs($user, 'sanctum')
            ->postJson("/api/polls/{$poll->id}/vote", [
                'poll_option_id' => $optionA->id,
            ]);

        $firstVote->assertStatus(201);

        $secondVote = $this->actingAs($user, 'sanctum')
            ->postJson("/api/polls/{$poll->id}/vote", [
                'poll_option_id' => $optionB->id,
            ]);

        $secondVote->assertStatus(422);
        $secondVote->assertJsonValidationErrors('poll_option_id');

        $this->assertDatabaseCount('votes', 1);
    }
}