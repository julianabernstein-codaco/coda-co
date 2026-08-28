#!/usr/bin/env bash
#
# Delete the Neon database branch belonging to a closed PR.
#
# Lives in its own file rather than inline in the workflow so it can be run
# and tested outside GitHub Actions (see NEON_API_BASE below).
#
# Contract:
#   exit 0  the branch is gone — either we deleted it, or it never existed /
#           something already cleaned it up (both are the desired end state)
#   exit 1  we could not establish that: missing config, bad credentials, an
#           unexpected API response. Never swallow these — a cleanup job that
#           quietly does nothing is how the branch limit crept up unnoticed
#           in the first place.
#
# Required env:
#   NEON_API_KEY      Neon API key (Bearer token)
#   NEON_PROJECT_ID   Neon project id
#   HEAD_REF          git branch of the PR that just closed
#   DEFAULT_BRANCH    the repo's default branch, for the safety check below
# Optional:
#   NEON_API_BASE     defaults to the public API; overridable for testing

set -euo pipefail

API_BASE="${NEON_API_BASE:-https://console.neon.tech/api/v2}"

fail() {
  echo "::error::$*"
  exit 1
}

[ -n "${NEON_API_KEY:-}" ] || fail "NEON_API_KEY is not set. Add it under Settings → Secrets and variables → Actions → Secrets."
[ -n "${NEON_PROJECT_ID:-}" ] || fail "NEON_PROJECT_ID is not set. Add it under Settings → Secrets and variables → Actions → Variables."
[ -n "${HEAD_REF:-}" ] || fail "HEAD_REF is empty — cannot tell which branch to delete."

# ── Safety ──────────────────────────────────────────────────────────────────
# A PR's head ref is normally a feature branch, but a PR opened from a fork
# whose branch is called "main" would make HEAD_REF "main" — and this script
# would then go looking for a Neon branch of that name, which is production.
# Refuse outright. (Neon's API also declines to delete a project's default
# branch, but this must not depend on a remote service saying no.)
PROTECTED="main master production prod default"
for protected in $PROTECTED ${DEFAULT_BRANCH:-}; do
  if [ "$HEAD_REF" = "$protected" ]; then
    echo "Refusing to touch a Neon branch named '$HEAD_REF' — that is a protected name."
    exit 0
  fi
done

api() {
  # api <method> <path> — echoes "<body>\n<status>"
  curl -sS -X "$1" \
    -H "Authorization: Bearer ${NEON_API_KEY}" \
    -H "Accept: application/json" \
    -w '\n%{http_code}' \
    "${API_BASE}/projects/${NEON_PROJECT_ID}$2"
}

# ── Find the branch ─────────────────────────────────────────────────────────
response="$(api GET /branches)" || fail "Could not reach the Neon API."
status="$(printf '%s' "$response" | tail -n1)"
body="$(printf '%s' "$response" | sed '$d')"

case "$status" in
  200) ;;
  401|403) fail "Neon API rejected the credentials (HTTP $status). Check NEON_API_KEY." ;;
  404) fail "Neon project '${NEON_PROJECT_ID}' not found (HTTP 404). Check NEON_PROJECT_ID." ;;
  *) fail "Unexpected HTTP $status listing Neon branches: $body" ;;
esac

# The integration names branches `preview/<git-branch>`; match a bare name too,
# so a differently-configured integration is still cleaned up. Exact matches
# only — substring matching on branch names is how you delete the wrong one.
targets="$(printf '%s' "$body" | jq -r --arg ref "$HEAD_REF" '
  .branches[]
  | select(.name == "preview/\($ref)" or .name == $ref)
  | "\(.id)\t\(.name)"
')"

if [ -z "$targets" ]; then
  echo "No Neon branch for '${HEAD_REF}' — already cleaned up. Nothing to do."
else
  while IFS=$'\t' read -r branch_id branch_name; do
    [ -n "$branch_id" ] || continue
    echo "Deleting Neon branch ${branch_name} (${branch_id})…"
    del="$(api DELETE "/branches/${branch_id}")" || fail "Delete request failed for ${branch_id}."
    del_status="$(printf '%s' "$del" | tail -n1)"
    del_body="$(printf '%s' "$del" | sed '$d')"
    case "$del_status" in
      200|201|202) echo "  deleted." ;;
      404) echo "  already gone." ;;
      *) fail "Could not delete ${branch_name} (HTTP $del_status): $del_body" ;;
    esac
  done <<< "$targets"
fi

# ── Report headroom ─────────────────────────────────────────────────────────
# The whole point is staying under the plan's branch cap, so make the current
# count visible in the job log rather than something you go hunting for.
remaining="$(api GET /branches | sed '$d' | jq '.branches | length' 2>/dev/null || echo "?")"
echo "Neon branches now in project ${NEON_PROJECT_ID}: ${remaining}"
