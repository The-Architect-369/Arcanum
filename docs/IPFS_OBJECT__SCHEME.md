\## \*\*IPFS Object Schema (Canonical)\*\*





\### \*\*Schema Name\*\*





```

arcanum.hope.reflection.g1

```





This string is \*\*mandatory\*\* and versioned. \\

&nbsp;It allows future systems to recognize, interpret, or safely ignore the object.





---





\## \*\*Canonical JSON Structure\*\*





```

{

&nbsp; "schema": "arcanum.hope.reflection.g1",



&nbsp; "content": {

&nbsp;   "text": "I arrived quietly today. I did not know what I was looking for.",

&nbsp;   "language": "en"

&nbsp; },



&nbsp; "created\_at": "2026-02-06T19:12:44Z",



&nbsp; "context": {

&nbsp;   "entry": "marketing",

&nbsp;   "mood": "quiet"

&nbsp; }

}





---

```







\## \*\*Field-by-Field Doctrine\*\*





\### \*\*<code>schema</code> (required)\*\*





```

"schema": "arcanum.hope.reflection.g1"



```







\* Declares \*\*what this object is \\

\*\*

\* Enables: \\



&nbsp;   \* Forward compatibility \\



&nbsp;   \* Safe filtering \\



&nbsp;   \* Non-Arcanum discovery without ambiguity \\



\* MUST be exact match \\







---





\### \*\*<code>content</code> (required)\*\*





```





\#### content.text

"text": "..."



```







\* Plain UTF-8 text only \\



\* No markdown \\



\* No embeds \\



\* No formatting semantics \\



\* Length guidance (not enforced on-chain): \\



&nbsp;   \* Recommended: 20–1,000 characters \\







\#### \*\*<code>content.language</code> (optional)\*\*





```

"language": "en"



```







\* ISO 639-1 preferred \\



\* Optional \\



\* Never inferred automatically \\







---





\### \*\*<code>created\_at</code> (required)\*\*





```

"created\_at": "ISO8601"



```







\* Client-provided timestamp \\



\* Treated as \*\*witnessed claim\*\*, not authoritative truth \\



\* Never corrected or normalized \\









---

\*\*<code>context</code> (optional)\*\*



This is \*\*non-semantic, user-declared context\*\*.





```





\#### context.entry

"entry": "marketing" | "direct" | "unknown"



```







\* Indicates \*how\* the reflection began \\



\* Used only for: \\



&nbsp;   \* UX understanding \\



&nbsp;   \* System tuning \\



\* Never shown prominently \\







```





\#### context.mood

"mood": "quiet"



```







\* Free-form string \\



\* No enumeration \\



\* No scoring \\



\* No aggregation \\







---





\## \*\*What Is Explicitly Forbidden in the Schema\*\*



These fields must \*\*never appear\*\*, even optionally:





```

author

user\_id

wallet

account

signature

likes

reactions

reply\_to

thread

edited\_at

deleted

score

visibility

permissions

```





If any appear → \*\*schema violation\*\*.





---





\## \*\*IPFS Storage Rules (G1)\*\*





\### \*\*Storage\*\*







\* Each reflection = \*\*one IPFS object \\

\*\*

\* Stored via `dag-cbor` or JSON (either acceptable) \\



\* CID is the \*\*only reference \\

\*\*





\### \*\*Mutability\*\*







\* ❌ No updates \\



\* ❌ No deletion \\



\* ❌ No pinning guarantees \\



\* ✔️ Natural disappearance is acceptable \\







---





\## \*\*Indexing (Non-Canonical, Implementation Detail)\*\*



To render a witness window, the app may maintain a \*\*temporary index\*\*, e.g.:





```

{

&nbsp; cid: string

&nbsp; created\_at: string

}

```





Important:







\* Index is \*\*not canonical \\

\*\*

\* Index can be wiped \\



\* Index does not confer permanence or ownership

