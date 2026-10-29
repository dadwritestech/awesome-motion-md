Build a single self-contained file at {OUT} (HTML + CSS + vanilla JS, no external
requests, no CDNs, no fonts from the network, system font stack only).

The UI: a small dark-themed project tracker called "Orbit".
- A top nav bar with the logo text, three nav links (Issues, Projects, Views) and a
  "New issue" button.
- A heading "Issues" with a one-line subtitle.
- A list of 6 issue cards (id like ORB-12, title, a status pill, an assignee initial
  avatar). The cards appear when the page loads.
- Hovering a card or a nav link gives feedback.
- Clicking "New issue" opens a modal dialog with a title input, and "Cancel" /
  "Create" buttons. Escape or Cancel closes it.
- Clicking "Create" closes the dialog, adds the new issue to the top of the list,
  and shows a toast "Issue created" in the bottom-right that disappears after 2.5s.
- Give the elements stable ids: #new-issue, #dialog, #title-input, #create, #cancel,
  #list, #toast. Cards get class "card".

Make the animations and interactions feel polished and production quality.
{MOTION}
Only write that one file. Do not read or open any other file in the repository
{READ}. Reply with one line when done.
