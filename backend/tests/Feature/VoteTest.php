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
    public function test_user_cannot_vote_on_closed_poll(): void
    {
        $user = User::factory()->create();

        $poll = Poll::create([
            'question' => 'Pergunta de teste',
            'user_id' => $user->id,
            'closes_at' => now()->subMinute(),
        ]);

        $option = PollOption::create([
            'poll_id' => $poll->id,
            'text' => 'Opção A',
        ]);

        $response = $this->actingAs($user, 'sanctum')
            ->postJson("/api/polls/{$poll->id}/vote", [
                'poll_option_id' => $option->id,
            ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors('poll_option_id');

        $this->assertDatabaseCount('votes', 0);
    }

    public function test_user_cannot_vote_on_option_from_a_different_poll(): void
    {
        $user = User::factory()->create();

        $pollA = Poll::create([
            'question' => 'Pergunta da enquete A',
            'user_id' => $user->id,
        ]);

        $pollB = Poll::create([
            'question' => 'Pergunta da enquete B',
            'user_id' => $user->id,
        ]);

        $optionFromPollB = PollOption::create([
            'poll_id' => $pollB->id,
            'text' => 'Opção da enquete B',
        ]);

        $response = $this->actingAs($user, 'sanctum')
            ->postJson("/api/polls/{$pollA->id}/vote", [
                'poll_option_id' => $optionFromPollB->id,
            ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors('poll_option_id');

        $this->assertDatabaseCount('votes', 0);
    }
}