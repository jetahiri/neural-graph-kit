"""Turn nodes.csv and edges.csv into the graph JSON (docs/DATA-SCHEMA.md).
Usage: python tools/csv_to_graph.py nodes.csv edges.csv "Title" > data/my-map.json
Groups are taken from the distinct values of the nodes' group column, in first-seen order."""
import csv
import json
import sys


def read(path):
    with open(path, newline="", encoding="utf-8-sig") as f:
        return [{k.strip(): (v or "").strip() for k, v in row.items() if k} for row in csv.DictReader(f)]


def main(nodes_path, edges_path, title="Relationship map"):
    nodes = [{k: v for k, v in n.items() if v} for n in read(nodes_path)]
    edges = [{k: v for k, v in e.items() if v} for e in read(edges_path)]
    groups = []
    for n in nodes:
        g = n.get("group")
        if g and g not in [x["id"] for x in groups]:
            groups.append({"id": g, "label": g})
    json.dump({"title": title, "groups": groups, "nodes": nodes, "edges": edges}, sys.stdout, indent=2)


if __name__ == "__main__":
    if len(sys.argv) < 3:
        sys.exit(__doc__)
    main(*sys.argv[1:4])
