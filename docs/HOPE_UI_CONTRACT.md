\# \*\*HOPE — UI Contract (Canonical)\*\*





\## \*\*0. Contract Principles (Binding)\*\*



The G1 HOPE UI must:







\* Enable \*\*arrival without obligation \\

\*\*

\* Enable \*\*reflection without reward \\

\*\*

\* Enable \*\*witnessing without hierarchy \\

\*\*

\* Treat \*\*silence as a valid state \\

\*\*

\* Avoid \*any\* mechanism that implies progress, status, or permanence \\





If a UI element suggests “you should post” or “you should return,” it violates G1.







---

\*\*1. Entry Contract (Marketing → HOPE)\*\*





\### \*\*Entry Path\*\*



A \*\*single, explicit route\*\* reachable without auth:





```

/hope/presence

```







\### \*\*Entry Guarantees\*\*







\* No wallet prompt \\



\* No modal stack \\



\* No redirect chains \\



\* No identity creation \\



\* No session persistence requirement \\







\### \*\*Entry Context Injection\*\*



On entry, the UI may internally set:





```

entryContext = "marketing"

```





This is used \*\*only\*\* to populate `context.entry` in the IPFS object.





---





\# \*\*2. Presence State (UI-Only)\*\*



On load, the UI establishes \*\*ephemeral presence\*\*:





```

presence = {

&nbsp; presence\_id: randomUUID(),

&nbsp; started\_at: now()

}

```





This state:







\* Lives in memory only \\



\* Is never shown \\



\* Is never named \\



\* Is discarded on refresh or exit \\





Presence exists only to support \*this moment\*.





---





\# \*\*3. Primary UI Regions (Exactly Three)\*\*



The G1 HOPE screen consists of \*\*three regions\*\*, no more.





---





\## \*\*Region A — Orientation (Optional, Minimal)\*\*





\### \*\*Purpose\*\*



To reassure, not instruct.





\### \*\*Characteristics\*\*







\* 1–2 short lines of text \\



\* No CTA language \\



\* No encouragement to post \\



\* No promises \\







\### \*\*Example (illustrative, not prescriptive)\*\*





&nbsp;   “You may leave a reflection, or simply be here.”



This region may be dismissed permanently \*for the session\*.





---





\## \*\*Region B — Reflection Editor (Optional Use)\*\*





\### \*\*Visibility\*\*







\* Present, but \*\*not emphasized \\

\*\*

\* Does not auto-focus \\



\* Does not block reading \\







\### \*\*Editor Capabilities\*\*







\* Plain text only \\



\* Single input field (textarea) \\



\* No formatting tools \\



\* No character counter \\



\* No autosave \\



\* No drafts \\







\### \*\*Submission Controls\*\*







\* Single action: \*\*“Leave reflection” \\

\*\*

\* Disabled until non-empty text \\



\* On submit: \\



&nbsp;   \* UI clears input \\



&nbsp;   \* No confirmation animation \\



&nbsp;   \* No success metrics \\



&nbsp;   \* No “thank you” reward language \\







\### \*\*Error Handling\*\*







\* Network/IPFS failure: \\



&nbsp;   \* Quiet inline message \\



&nbsp;   \* No retry pressure \\



&nbsp;   \* Reflection may be lost (acceptable) \\







---





\## \*\*Region C — Witness Window (Read-Only)\*\*





\### \*\*Purpose\*\*



To witness presence without social mechanics.





\### \*\*Display Rules\*\*







\* Chronological order (fixed direction) \\



\* Hard cap (e.g. last 50–100 reflections) \\



\* No pagination \\



\* No infinite scroll \\



\* No sorting options \\







\### \*\*Per-Reflection Display\*\*



Each reflection shows:







\* Text \\



\* Optional soft timestamp (e.g. “earlier today”, “yesterday”) \\





Each reflection must \*\*not\*\* show:







\* Author \\



\* Likes \\



\* Replies \\



\* Actions \\



\* Share buttons \\



\* Flags \\



\* Permalinks (in G1) \\







---





\# \*\*4. States the UI Must Support\*\*





\### \*\*4.1 Empty State\*\*







\* Witness window may be empty \\



\* Must not prompt content creation \\



\* Example: \\

&nbsp;\\

&nbsp;\\

&nbsp;“Nothing has been left here yet.” \\

&nbsp;\\





Silence is valid.





---





\### \*\*4.2 Read-Only State\*\*







\* User may scroll and leave without interacting \\



\* No degradation or nagging \\







---





\### \*\*4.3 Submit-and-Leave State\*\*







\* After submitting, user may leave immediately \\



\* No “stay longer” mechanics \\







---





\# \*\*5. Data Flow Contract (UI Perspective)\*\*





\### \*\*On Submit\*\*





```

Reflection → IPFS → CID



```







\* CID may be added to a \*\*local, ephemeral index \\

\*\*

\* UI does not expose CID \\



\* UI does not claim permanence \\







\### \*\*On Read\*\*





```

CID index → fetch object → render

```





If fetch fails:







\* Reflection simply does not appear \\



\* No warnings required \\







---





\# \*\*6. Explicit UI Prohibitions (Hard Rules)\*\*



The G1 HOPE UI must NOT include:





<table>

&nbsp; <tr>

&nbsp;  <td><strong>Element</strong>

&nbsp;  </td>

&nbsp;  <td><strong>Status</strong>

&nbsp;  </td>

&nbsp; </tr>

&nbsp; <tr>

&nbsp;  <td>Login / wallet connect

&nbsp;  </td>

&nbsp;  <td>❌

&nbsp;  </td>

&nbsp; </tr>

&nbsp; <tr>

&nbsp;  <td>User names / avatars

&nbsp;  </td>

&nbsp;  <td>❌

&nbsp;  </td>

&nbsp; </tr>

&nbsp; <tr>

&nbsp;  <td>Counts (views, likes)

&nbsp;  </td>

&nbsp;  <td>❌

&nbsp;  </td>

&nbsp; </tr>

&nbsp; <tr>

&nbsp;  <td>Threads or replies

&nbsp;  </td>

&nbsp;  <td>❌

&nbsp;  </td>

&nbsp; </tr>

&nbsp; <tr>

&nbsp;  <td>Emojis or reactions

&nbsp;  </td>

&nbsp;  <td>❌

&nbsp;  </td>

&nbsp; </tr>

&nbsp; <tr>

&nbsp;  <td>Editing / deleting

&nbsp;  </td>

&nbsp;  <td>❌

&nbsp;  </td>

&nbsp; </tr>

&nbsp; <tr>

&nbsp;  <td>“New” badges

&nbsp;  </td>

&nbsp;  <td>❌

&nbsp;  </td>

&nbsp; </tr>

&nbsp; <tr>

&nbsp;  <td>Notifications

&nbsp;  </td>

&nbsp;  <td>❌

&nbsp;  </td>

&nbsp; </tr>

&nbsp; <tr>

&nbsp;  <td>Gamified language

&nbsp;  </td>

&nbsp;  <td>❌

&nbsp;  </td>

&nbsp; </tr>

&nbsp; <tr>

&nbsp;  <td>Infinite scroll

&nbsp;  </td>

&nbsp;  <td>❌

&nbsp;  </td>

&nbsp; </tr>

</table>





If users ask “where is X?”, the answer is:





&nbsp;   “It does not exist here.”





---





\# \*\*7. Relationship to Existing Repo Code\*\*





\### \*\*What We Reuse\*\*







\* IPFS infra (`lib/infra/ipfs.ts`) \\



\* Narrative copy (selectively) \\



\* Marketing link components \\



\* Styling tokens \\







\### \*\*What We Isolate\*\*







\* Existing `/hope/character \\

`

\* `/hope/inventory \\

`

\* `/hope/stylize \\

`



Those remain \*\*future HOPE\*\*, not G1 HOPE.



