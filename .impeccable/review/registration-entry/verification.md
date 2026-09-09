# Clear registration role choice

Owner request: registration must first show two clear cards for Teacher and Student.

`/register` now renders the role-choice page; `/signup` remains a compatible entry. Landing registration actions, desktop/mobile header registration, login-page account creation and public practice account creation all lead to this choice. Each card is a real link to its respective existing signup flow. Teacher continues to workplace selection; Student continues to stage and optional grade selection. Existing direct role URLs remain valid.

The choice page uses a 760px maximum width, two 300px-minimum-height cards on desktop and vertically stacked cards at600px or narrower. Teacher retains Answer Red; Student uses primary Asasera Blue. Each has a large role label, a concise explanation, a Lucide icon and a written Continue-as action. Arabic and English copy are complete; RTL arrows mirror and reduced motion disables movement. Cards use visible keyboard focus and descriptive accessible names.

Production build, bundle assertions, scoped lint and whitespace checks passed. All15 existing login-return/navigation tests passed. One static detector scan reports only advisory32px role-label size and black mixing for hover; these are deliberate local typography and derived-color choices. No new tests were added for this reversible UI/routing refinement.

Browser inspection remains unavailable due the existing browser-security policy denial. No alternate browser or indirect workaround was used; rendered desktop/mobile appearance is not claimed verified.
