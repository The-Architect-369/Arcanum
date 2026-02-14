\# \*\*HOPE Data Model (Canonical)\*\*



This model is \*\*not\*\* an app model, \*\*not\*\* an identity model, and \*\*not\*\* a social model.



It is a \*\*presence + reflection model only\*\*.





---





\## \*\*Design Constraints (Non-Negotiable)\*\*



Derived from:







\* Genesis Roadmap (G1) \\



\* HOPE canonical module \\



\* Layer boundaries \\







\### \*\*The G1 HOPE model MUST:\*\*







\* Allow anonymous / ephemeral use \\



\* Make no claims of identity \\



\* Carry no progression or value \\



\* Avoid engagement optimization \\



\* Be content-addressable \\



\* Be interpretable without context \\







\### \*\*The G1 HOPE model MUST NOT:\*\*







\* Reference wallets \\



\* Reference accounts \\



\* Reference identity IDs \\



\* Reference scores, likes, reactions \\



\* Imply persistence or ownership \\







---





\# \*\*G1 HOPE — Core Conceptual Model\*\*



At G1, HOPE consists of \*\*three conceptual entities only\*\*:







1\. \*\*Presence \\

\*\*

2\. \*\*Reflection \\

\*\*

3\. \*\*Witness Window \\

\*\*



No more. No less.





---





\## \*\*1. Presence (Ephemeral, Non-Identifying)\*\*



Presence is \*\*not identity\*\*. \\

&nbsp;It is simply “someone is here, now.”





\### \*\*Presence Properties\*\*





```

Presence {

&nbsp; presence\_id: string        // random UUID, session-scoped

&nbsp; started\_at: ISO8601        // client-side timestamp

&nbsp; context?: string           // optional (e.g. "marketing-entry")

}

```







\### \*\*Notes\*\*







\* `presence\_id` is \*\*not stored long-term \\

\*\*

\* Exists only to: \\



&nbsp;   \* Group reflections in-session \\



&nbsp;   \* Avoid duplicate submits \\



\* Can be discarded at any time \\





➡️ Presence never leaves the client \*\*unless strictly needed\*\*.





---





\## \*\*2. Reflection (The Only Durable Artifact)\*\*



This is the \*\*heart of G1 HOPE\*\*.





\### \*\*Reflection Properties (Canonical)\*\*





```

Reflection {

&nbsp; schema: "arcanum.hope.reflection.g1"



&nbsp; content: {

&nbsp;   text: string             // plain text only (G1)

&nbsp;   language?: string        // optional, e.g. "en"

&nbsp; }



&nbsp; created\_at: ISO8601        // client-provided timestamp



&nbsp; context?: {

&nbsp;   entry?: "marketing" | "direct" | "unknown"

&nbsp;   mood?: string            // optional, user-chosen, non-enumerated

&nbsp; }

}

```







\### \*\*Critical Observations\*\*







\* No author \\



\* No owner \\



\* No permanence claim \\



\* No guarantees of retrieval \\



\* No ordering beyond time \\





This object is \*\*meaningful on its own\*\*, even if found years later.







---

\*\*3. Witness Window (Derived, Not Stored)\*\*



A \*\*Witness Window\*\* is not a stored object.



It is a \*\*view rule\*\*:





&nbsp;   “Show a bounded, recent set of reflections without ranking.”





\### \*\*Witness Window Rules\*\*







\* Chronological (oldest → newest or reverse, but fixed) \\



\* Hard cap (e.g. last 50–200 reflections) \\



\* No pagination pressure \\



\* No infinite scroll \\





This ensures:







\* No feed addiction \\



\* No social dominance \\



\* No virality mechanics \\









---

\*\*What Is Explicitly Absent (By Design)\*\*





<table>

&nbsp; <tr>

&nbsp;  <td><strong>Concept</strong>

&nbsp;  </td>

&nbsp;  <td><strong>Status</strong>

&nbsp;  </td>

&nbsp; </tr>

&nbsp; <tr>

&nbsp;  <td>User ID

&nbsp;  </td>

&nbsp;  <td>❌ Forbidden

&nbsp;  </td>

&nbsp; </tr>

&nbsp; <tr>

&nbsp;  <td>Wallet

&nbsp;  </td>

&nbsp;  <td>❌ Forbidden

&nbsp;  </td>

&nbsp; </tr>

&nbsp; <tr>

&nbsp;  <td>Likes / reactions

&nbsp;  </td>

&nbsp;  <td>❌ Forbidden

&nbsp;  </td>

&nbsp; </tr>

&nbsp; <tr>

&nbsp;  <td>Replies

&nbsp;  </td>

&nbsp;  <td>❌ Forbidden

&nbsp;  </td>

&nbsp; </tr>

&nbsp; <tr>

&nbsp;  <td>Threads

&nbsp;  </td>

&nbsp;  <td>❌ Forbidden

&nbsp;  </td>

&nbsp; </tr>

&nbsp; <tr>

&nbsp;  <td>Editing

&nbsp;  </td>

&nbsp;  <td>❌ Forbidden

&nbsp;  </td>

&nbsp; </tr>

&nbsp; <tr>

&nbsp;  <td>Deletion

&nbsp;  </td>

&nbsp;  <td>❌ Forbidden

&nbsp;  </td>

&nbsp; </tr>

&nbsp; <tr>

&nbsp;  <td>Metrics

&nbsp;  </td>

&nbsp;  <td>❌ Forbidden

&nbsp;  </td>

&nbsp; </tr>

</table>





Silence is allowed. \\

&nbsp;Vanishing is allowed. \\

&nbsp;Being unseen is allowed.







---

\*\*Relationship to IPFS (Preview, Not Schema Yet)\*\*



At this stage, the only thing that matters:







\* \*\*Each Reflection → one content-addressed object \\

\*\*

\* The CID \*is\* the reference \\



\* No mutable pointers (yet) \\



\* No identity binding \\





IPFS is a \*\*transport + witness\*\*, not a social layer.



We will formalize this next.



