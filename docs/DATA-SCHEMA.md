# Data schema

One JSON object. Anything not listed here is ignored.

```json
{
  "title": "Shown in the top bar",
  "groups": [ { "id": "sources", "label": "Sources" } ],
  "nodes": [
    {
      "id": "crm",                 // required, unique
      "label": "Customer system",  // shown name (defaults to id)
      "kind": "Source database",   // one short line under the name
      "group": "sources",          // a group id, optional
      "status": "ok",              // ok | warn | error | idle (default idle)
      "statusText": "Healthy",     // optional, replaces the default word
      "description": "One or two plain sentences, shown in the side panel.",
      "x": 0, "y": 0               // optional; leave out to lay out automatically
    }
  ],
  "edges": [
    { "from": "crm", "to": "ingest", "label": "nightly copy", "type": "flow" }  // type: flow (default) | oversee
  ]
}
```

Edges that name a missing node are dropped. Options for `NeuralGraph.render(el, data, options)`: `theme` (`auto`, `light`, `dark`), `ambient` (beams fire at rest, default `true`), `nodeW`, `nodeH`, `colGap`, `rowGap`, `groupPad`, `beamMs`.

## From a spreadsheet

Two CSV files, `nodes.csv` (columns `id,label,kind,group,status,description`) and `edges.csv` (columns `from,to,label,type`), become the JSON with:

```
python tools/csv_to_graph.py nodes.csv edges.csv "My map" > data/my-map.json
```
