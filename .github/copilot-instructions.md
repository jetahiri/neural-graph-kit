# Neural graph look (for any relationship or architecture diagram)

When I ask to create or restyle a diagram, make it in this look. Keep every name and connection from the source exactly; invent nothing.

## Layout
- Flow left to right. A node's column = 1 + the column of the furthest node feeding it. Watch-only nodes sit one column before what they watch.
- Groups (subgraphs, schemas, swimlanes) = soft rounded regions behind their members: radius 40, fill white 28%, 1px faint blue rim, label top-left in the heading font.

## Nodes
- Glass card 232x104, radius 24: background rgba(255,255,255,.62), backdrop-filter blur(28px) saturate(1.5), inset 1px white rim, shadow 0 28px 56px -30px rgba(20,60,100,.5).
- Name (heading font, 17px), one-line kind under it (12px, muted), then status: a dot plus the status word (never colour alone).
- 4px status bar on the card's left edge. Status: ok "Healthy" rgb(46,158,102); warn "Needs a look" rgb(230,158,44); error "Broken" rgb(224,84,68); idle "Off or not run yet" rgb(118,136,153). Warn and error dots pulse.

## Connectors
- Cubic bezier from the side facing the target to the side facing the source; control length = 42% of distance, clamped 44 to 160.
- Flow = solid 1.8px rgba(23,82,133,.32); oversight/monitoring = dashed 6 6. Small arrowhead at the end.

## Light (the neural effect)
Each connector carries a beam: a copy of the path stroked with a userSpaceOnUse linearGradient (stops: 0 #4a9ad2 opacity 0, .4 #4a9ad2 1, .72 #1b5f9e 1, 1 #1b5f9e 0), plus an 8px blur(5px) copy under it at 55% opacity as glow. Each frame, for progress x over 2.8s:
```js
p = x >= 1 ? 1 : 1 - Math.pow(2, -10 * x);  a = -0.4 + 1.5 * p;  // dx,dy = p1 - p0
grad.x1 = p0.x + dx * a; grad.y1 = p0.y + dy * a; grad.x2 = p0.x + dx * (a + 0.4); grad.y2 = p0.y + dy * (a + 0.4);
```
At rest every connector fires on its own random rhythm (start delay 0 to 4s, pause 1.8 to 6s). Hover or click a node: its connectors turn solid #1b5f9e and loop fast, their labels show, everything unrelated dims to 45%.

## Interaction and modes
- Click a node: glass side panel with name, kind, status, description, "Gets input from" and "Sends output to" as clickable chips. Esc closes.
- Wheel zoom at cursor, drag to pan, Fit button. Legend bottom-left (solid = sends work to, dashed = oversees, the four status words).
- Background: linear-gradient(160deg,#eef3f8,#dfe8f1) with a warm radial glow top-right and a cool one bottom-left.
- Dark mode, same layout: glass rgba(20,32,52,.58), text #eef4fa, background #0b1626 to #08101c, beam #7fc1f5 to #a9d4f7, connectors rgba(190,214,255,.34).
- prefers-reduced-motion: no beams or pulses; lit connectors drawn solid.
- Fonts: headings Young Serif (fallback Georgia), text Nunito (fallback system sans). Sentence case.

## Other tools
- Web page: plain HTML, CSS, SVG and JS, no libraries.
- Mermaid: `flowchart LR`, curve basis, subgraph per group, `-.->` for oversight, classDef per status with the colours above. No animation.
- draw.io: rounded cards (arc 24, white 62% fill, shadow), edges `curved=1;flowAnimation=1`, containers at 30% fill with no stroke.
