package handler

// [WHO]: Provides daemon workspace queries, returning DaemonWorkspaceResponse with workspace ID/name/slug for the connected runtime workspace context
// [FROM]: Depends on pkg/db/generated for workspace queries, internal/middleware for daemon auth context
// [TO]: Consumed by daemon WebSocket pipeline for runtime workspace resolution
// [HERE]: server/internal/handler/daemon_workspace.go - daemon-scoped workspace lookups; sits adjacent to daemon.go (connection management) and daemon_rpc.go (RPC delegation)
// [WHO]: Provides daemon workspace queries, returning DaemonWorkspaceResponse with workspace ID/name/slug for the connected runtime workspace context
// [FROM]: Depends on pkg/db/generated for workspace queries, internal/middleware for daemon auth context
// [TO]: Consumed by daemon WebSocket pipeline for runtime workspace resolution
// [HERE]: server/internal/handler/daemon_workspace.go - daemon-scoped workspace lookups; sits adjacent to daemon.go (connection management) and daemon_rpc.go (RPC delegation)
import (
	"crypto/sha256"
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/jackc/pgx/v5/pgtype"
	"github.com/multica-ai/multica/server/internal/middleware"
)

type DaemonWorkspaceResponse struct {
	ID   string `json:"id"`
	Name string `json:"name"`
}

// ListDaemonWorkspaces returns the minimal workspace membership projection
// needed by local daemons. User-scoped PAT/JWT callers receive every workspace
// they belong to; workspace-scoped daemon tokens receive only their bound
// workspace.
func (h *Handler) ListDaemonWorkspaces(w http.ResponseWriter, r *http.Request) {
	var resp []DaemonWorkspaceResponse
	if userID := requestUserID(r); userID != "" {
		rows, err := h.Queries.ListDaemonWorkspaces(r.Context(), parseUUID(userID))
		if err != nil {
			writeError(w, http.StatusInternalServerError, "failed to list daemon workspaces")
			return
		}
		resp = make([]DaemonWorkspaceResponse, len(rows))
		for i, row := range rows {
			resp[i] = daemonWorkspaceToResponse(row.ID, row.Name)
		}
	} else {
		workspaceID := middleware.DaemonWorkspaceIDFromContext(r.Context())
		if workspaceID == "" {
			writeError(w, http.StatusUnauthorized, "daemon workspace identity required")
			return
		}
		row, err := h.Queries.GetDaemonWorkspace(r.Context(), parseUUID(workspaceID))
		if err != nil {
			writeError(w, http.StatusNotFound, "workspace not found")
			return
		}
		resp = []DaemonWorkspaceResponse{daemonWorkspaceToResponse(row.ID, row.Name)}
	}

	etag := daemonWorkspacesETag(resp)
	w.Header().Set("Cache-Control", "private, no-cache")
	w.Header().Set("ETag", etag)
	if r.Header.Get("If-None-Match") == etag {
		w.WriteHeader(http.StatusNotModified)
		return
	}
	writeJSON(w, http.StatusOK, resp)
}

func daemonWorkspaceToResponse(id pgtype.UUID, name string) DaemonWorkspaceResponse {
	return DaemonWorkspaceResponse{ID: uuidToString(id), Name: name}
}

func daemonWorkspacesETag(workspaces []DaemonWorkspaceResponse) string {
	data, _ := json.Marshal(workspaces)
	sum := sha256.Sum256(data)
	return fmt.Sprintf(`W/"%x"`, sum)
}
