// [WHO]: Provides agent emoji avatar assignment using a curated emoji pool with random generation via crypto/rand
// [FROM]: Depends on crypto/rand for secure random emoji selection, pkg/db/generated for agent avatar storage
// [TO]: Consumed by agent.go (create/update fallback avatar) and agent_builder.go (new agent creation)
// [HERE]: server/internal/handler/agent_avatar.go - emoji avatar utilities for agents; sits adjacent to agent.go (agent CRUD that assigns avatars) and agent_builder.go (agent creation flow)

package handler

import (
	"crypto/rand"
	"math/big"
	"strings"

	"github.com/jackc/pgx/v5/pgtype"
)

const agentEmojiAvatarPrefix = "emoji:"

var agentEmojiAvatars = []string{
	"🐙", "🦊", "🦉", "🐝", "🐼", "🐸", "🐯", "🦁",
	"🐨", "🐵", "🐧", "🐳", "🦋", "🌞", "🌙", "⭐",
	"🔥", "⚡", "🍀", "🌈", "🚀", "🤖", "👾", "🧠",
}

func randomAgentEmojiAvatar() string {
	index, err := rand.Int(rand.Reader, big.NewInt(int64(len(agentEmojiAvatars))))
	if err != nil {
		return agentEmojiAvatarPrefix + agentEmojiAvatars[0]
	}
	return agentEmojiAvatarPrefix + agentEmojiAvatars[index.Int64()]
}

func newAgentAvatar(avatarURL *string) pgtype.Text {
	if avatarURL != nil && strings.TrimSpace(*avatarURL) != "" {
		return pgtype.Text{String: *avatarURL, Valid: true}
	}
	return pgtype.Text{String: randomAgentEmojiAvatar(), Valid: true}
}
