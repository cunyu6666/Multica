// [WHO]: Provides ContentSecurityPolicy middleware — sets CSP headers with path-aware policy selection
// [FROM]: Depends on net/http for request handling
// [TO]: Consumed by router (applied globally) for all HTTP responses
// [HERE]: server/internal/middleware/csp.go - applies Content-Security-Policy headers; uses stricter policy for attachment preview paths (allows frame-ancestors 'self') vs standard policy for all other paths; sits alongside auth.go and ratelimit.go as cross-cutting security middleware
package middleware

const cspBaseHeader = "default-src 'self'; " +
	"script-src 'self'; " +
	"style-src 'self' 'unsafe-inline'; " +
	"img-src 'self' https: data:; " +
	"connect-src 'self' wss:; "

const cspHeader = cspBaseHeader +
	"frame-ancestors 'none'; " +
	"object-src 'none'; " +
	"base-uri 'self'; " +
	"form-action 'self'"

const attachmentPreviewCSPHeader = cspBaseHeader +
	"frame-ancestors 'self'; " +
	"object-src 'none'; " +
	"base-uri 'self'; " +
	"form-action 'self'"

func ContentSecurityPolicy(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Security-Policy", contentSecurityPolicyForRequest(r))
		next.ServeHTTP(w, r)
	})
}

func contentSecurityPolicyForRequest(r *http.Request) string {
	if isAttachmentPreviewDocumentPath(r.URL.Path) {
		return attachmentPreviewCSPHeader
	}
	return cspHeader
}

func isAttachmentPreviewDocumentPath(path string) bool {
	return strings.HasPrefix(path, "/api/attachments/") &&
		(strings.HasSuffix(path, "/download") || strings.HasSuffix(path, "/content"))
}
