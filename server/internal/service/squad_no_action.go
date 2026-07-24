// [WHO]: Provides HasSquadLeaderNoActionEvaluationForTask — checks whether a squad leader no_action evaluation already exists for a task
// [FROM]: Depends on pkg/db/generated for database queries, internal/util for UUID conversion
// [TO]: Consumed by service (squad leader evaluation dedup logic)
// [HERE]: server/internal/service/squad_no_action.go - lightweight database check preventing duplicate squad leader no_action evaluations for the same task; called before recording new evaluations
package service

import (
	"context"

	"github.com/multica-ai/multica/server/internal/util"
	db "github.com/multica-ai/multica/server/pkg/db/generated"
)

// HasSquadLeaderNoActionEvaluationForTask reports whether this exact task
// already recorded a squad leader no_action evaluation.
func HasSquadLeaderNoActionEvaluationForTask(ctx context.Context, q *db.Queries, task db.AgentTaskQueue) (bool, error) {
	if q == nil || !task.ID.Valid || !task.IssueID.Valid || !task.AgentID.Valid {
		return false, nil
	}
	return q.HasSquadLeaderNoActionEvaluationForTask(ctx, db.HasSquadLeaderNoActionEvaluationForTaskParams{
		IssueID: task.IssueID,
		AgentID: task.AgentID,
		TaskID:  util.UUIDToString(task.ID),
	})
}
