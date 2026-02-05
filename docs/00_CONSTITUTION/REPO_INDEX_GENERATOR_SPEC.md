\# \*\*REPO\_INDEX Generator — Design \& Specification\*\*



\*\*Version:\*\* 1.0 \\

\*\*Status:\*\* Canonical Design \\

\*\*Phase:\*\* Pre-Genesis





---





\## \*\*Purpose\*\*



This document specifies the \*\*REPO\_INDEX generator\*\*: a deterministic, reproducible mechanism for producing a complete structural snapshot of the Arcanum repository.



The REPO\_INDEX exists to satisfy the \*\*Architect Repository Interface\*\* requirement that architectural reasoning must be grounded in explicit repository state, even when GitHub APIs are constrained.





---





\## \*\*Canonical Output\*\*



The generator produces a single canonical artifact:



docs/architect/REPO\_INDEX.json



This file is the \*\*authoritative structural index\*\* of the repository at a given commit.





---





\## \*\*Design Principles\*\*







1\. \*\*Structure over content \\

\*\*The index captures \*what exists\*, not \*what it means\*.

2\. \*\*Deterministic \\

\*\*Given the same repo state, the output must be identical.

3\. \*\*Lightweight \\

\*\*Must be loadable in full by Architect GPT without truncation.

4\. \*\*Auditable \\

\*\*Humans must be able to inspect and reason about it easily.

5\. \*\*Fail-closed \\

\*\*If generation fails, architectural analysis is blocked.





---





\## \*\*Required Fields (Per File)\*\*



Each file entry in `REPO\_INDEX.json` MUST include:



{



&nbsp; "path": "docs/01\_SYSTEM\_MAP/LAYER\_BOUNDARIES.md",



&nbsp; "type": "file",



&nbsp; "size\_bytes": 4127,



&nbsp; "last\_modified\_commit": "a1b2c3d",



&nbsp; "is\_empty": false



}





\### \*\*Field Definitions\*\*







\* \*\*path\*\* — repository-relative path

\* \*\*type\*\* — `file` or `directory`

\* \*\*size\_bytes\*\* — exact size on disk

\* \*\*last\_modified\_commit\*\* — short git SHA

\* \*\*is\_empty\*\* — `true` if size is 0 or below a configured threshold





---





\## \*\*Optional Fields (Recommended)\*\*



These fields may be included if available without cost explosion:



"hash": "sha256:…",



"lines": 132,



"extension": ".md"





---





\## \*\*Index Structure\*\*



Top-level structure:



{



&nbsp; "generated\_at": "2026-02-02T00:00:00Z",



&nbsp; "repo": "The-Architect-369/Arcanum",



&nbsp; "commit": "1224d2d",



&nbsp; "generator\_version": "1.0",



&nbsp; "files": \[ … ]



}



Ordering rule:







\* Sorted lexicographically by `path`





---





\## \*\*Generation Mechanism\*\*





\### \*\*Primary Method: Git + Filesystem\*\*



The generator runs \*\*inside the repo\*\* and uses:







\* `git ls-files`

\* `git log -1 -- \&lt;path>`

\* POSIX filesystem stats



This avoids GitHub API limits entirely.





---





\## \*\*Reference Implementation (Bash)\*\*



\#!/usr/bin/env bash



set -euo pipefail



OUTPUT="docs/architect/REPO\_INDEX.json"



THRESHOLD\_EMPTY=5



commit=$(git rev-parse --short HEAD)



now=$(date -u +"%Y-%m-%dT%H:%M:%SZ")



files\_json=$(git ls-files -z | while IFS= read -r -d '' file; do



&nbsp; size=$(stat -c%s "$file")



&nbsp; last\_commit=$(git log -1 --pretty=format:%h -- "$file")



&nbsp; is\_empty=false



&nbsp; if \[ "$size" -le "$THRESHOLD\_EMPTY" ]; then



&nbsp;   is\_empty=true



&nbsp; fi



&nbsp; printf '{"path":"%s","type":"file","size\_bytes":%s,"last\_modified\_commit":"%s","is\_empty":%s}\\n' \\



&nbsp;   "$file" "$size" "$last\_commit" "$is\_empty"



done | jq -s '.')



jq -n \\



&nbsp; --arg now "$now" \\



&nbsp; --arg commit "$commit" \\



&nbsp; --arg repo "The-Architect-369/Arcanum" \\



&nbsp; --argjson files "$files\_json" \\



&nbsp; '{generated\_at:$now,repo:$repo,commit:$commit,generator\_version:"1.0",files:$files}' \\



&nbsp; > "$OUTPUT"



echo "REPO\_INDEX generated at $OUTPUT"





---





\## \*\*CI Integration\*\*





\### \*\*verify-sync.sh\*\*







\* Extend to:

&nbsp;   \* Generate REPO\_INDEX

&nbsp;   \* Fail if generation fails





\### \*\*GitHub Action\*\*







\* Run on:

&nbsp;   \* `push`

&nbsp;   \* `pull\_request`

\* Optionally diff previous index to detect structural drift





---





\## \*\*Architect GPT Contract\*\*



Architect GPT:







\* MUST prefer `index-snapshot` grounding when REPO\_INDEX exists

\* MUST refuse repo-wide conclusions if REPO\_INDEX is missing or stale

\* MAY request regeneration when ambiguity exists





---





\## \*\*Failure Modes\*\*



The system is considered unhealthy if:







\* REPO\_INDEX.json is missing

\* REPO\_INDEX.json does not match HEAD

\* Generator exits non-zero

\* Files exist in repo but not in index



All are \*\*hard failures\*\* for architectural reasoning.





---





\## \*\*Canonical Status\*\*



This document defines the canonical \*\*REPO\_INDEX generator v1.0\*\*.



It is binding for CI, Architect GPT operation, and all future repo health analysis.

