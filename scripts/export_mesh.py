"""
Export fsaverage5 mesh + Destrieux atlas as JSON for the frontend.
Outputs: frontend/public/data/mesh.json

Run: python scripts/export_mesh.py
Requires: pip install nilearn numpy
"""

import json
import numpy as np
from pathlib import Path


def export_mesh():
    from nilearn.datasets import load_fsaverage, fetch_atlas_surf_destrieux

    # Load fsaverage5 mesh (10242 vertices per hemisphere = 20484 total)
    fsaverage = load_fsaverage("fsaverage5")
    pial = fsaverage["pial"]
    lh = pial.parts["left"]
    rh = pial.parts["right"]

    lh_coords = lh.coordinates  # (10242, 3)
    lh_faces = lh.faces          # (20480, 3)
    rh_coords = rh.coordinates
    rh_faces = rh.faces

    # Combine hemispheres: offset right hemisphere face indices by left vertex count
    n_left = len(lh_coords)
    rh_faces_offset = rh_faces + n_left

    vertices = np.vstack([lh_coords, rh_coords])
    faces = np.vstack([lh_faces, rh_faces_offset])

    print(f"Vertices: {len(vertices)} (L:{n_left}, R:{len(rh_coords)})")
    print(f"Faces: {len(faces)}")

    # Load Destrieux surface atlas (downloads ~2MB annot files from NITRC)
    print("Loading Destrieux surface atlas...")
    destrieux = fetch_atlas_surf_destrieux()

    labels = destrieux["labels"]           # list of region name strings
    map_left = destrieux["map_left"]       # (10242,) label index per vertex
    map_right = destrieux["map_right"]     # (10242,) label index per vertex

    # Combine: right hemisphere vertex indices are offset by n_left
    all_label_indices = np.concatenate([map_left, map_right])

    # Build regionMap: label name -> list of vertex indices
    region_map = {}
    for label_idx, name in enumerate(labels):
        if name in ("Unknown", "Medial_wall", ""):
            continue
        vertex_indices = np.where(all_label_indices == label_idx)[0].tolist()
        if len(vertex_indices) > 0:
            region_map[name] = vertex_indices

    print(f"Regions: {len(region_map)}")

    # Write output
    out_path = Path(__file__).parent.parent / "frontend" / "public" / "data" / "mesh.json"
    out_path.parent.mkdir(parents=True, exist_ok=True)

    with open(out_path, "w") as f:
        json.dump({
            "vertices": vertices.tolist(),
            "faces": faces.tolist(),
            "regionMap": region_map,
        }, f)

    size_mb = out_path.stat().st_size / 1024 / 1024
    print(f"Written: {out_path} ({size_mb:.1f} MB)")
    print(f"Vertex count: {len(vertices)}")
    print(f"Face count: {len(faces)}")
    print(f"Region count: {len(region_map)}")


if __name__ == "__main__":
    export_mesh()
