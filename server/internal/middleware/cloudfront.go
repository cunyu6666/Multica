// [WHO]: Provides RefreshCloudFrontCookies — middleware that refreshes CloudFront signed cookies on authenticated requests
// [FROM]: Depends on internal/auth for CloudFrontSigner and AuthTokenTTL
// [TO]: Consumed by router (applied to authenticated routes) to prevent CDN 403s from expired cookies
// [HERE]: server/internal/middleware/cloudfront.go - auto-refreshes CloudFront-Policy/Signature/Key-Pair-Id cookies when missing (expired or first request); no-op when signer is nil (self-hosted)
package middleware

import (
	"net/http"
	"time"

	"github.com/multica-ai/multica/server/internal/auth"
)

// RefreshCloudFrontCookies is middleware that refreshes CloudFront signed cookies
// on authenticated requests when the cookie is missing (expired or first request
// after login). This prevents 403s from the CDN when cookies expire before the
// user's session does.
func RefreshCloudFrontCookies(signer *auth.CloudFrontSigner) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		if signer == nil {
			return next
		}
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if _, err := r.Cookie("CloudFront-Policy"); err != nil {
				ttl := auth.AuthTokenTTL()
				for _, cookie := range signer.SignedCookies(time.Now().Add(ttl)) {
					http.SetCookie(w, cookie)
				}
			}
			next.ServeHTTP(w, r)
		})
	}
}
