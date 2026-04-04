"""
Export fsaverage5 mesh + Destrieux atlas as JSON for the frontend.
Outputs: public/data/mesh.json

Run: python scripts/export_mesh.py
Requires: pip install nilearn numpy
"""

import json
import numpy as np
from pathlib import Path


def export_mesh():
    from nilearn.datasets import load_fsaverage
    from nilearn.datasets import fetch_atlas_destrieux_2009

    # Load fsaverage5 mesh (10242 vertices per hemisphere)
    fsaverage = load_fsaverage(mesh_name="fsaverage5")

    # Load both hemispheres
    from nilearn.surface import load_surf_mesh

    lh_coords, lh_faces = load_surf_mesh(fsaverage["pial_left"])
    rh_coords, rh_faces = load_surf_mesh(fsaverage["pial_right"])

    # Combine hemispheres: right hemisphere faces need offset by left vertex count
    n_left = len(lh_coords)
    rh_faces_offset = rh_faces + n_left

    vertices = np.vstack([lh_coords, rh_coords])
    faces = np.vstack([lh_faces, rh_faces_offset])

    print(f"Vertices: {len(vertices)} (L:{n_left}, R:{len(rh_coords)})")
    print(f"Faces: {len(faces)}")

    # Load Destrieux atlas for region parcellation
    destrieux = fetch_atlas_destrieux_2009()

    # Load label arrays for each hemisphere
    from nilearn.surface import load_surf_data

    lh_labels = load_surf_data(fsaverage["sulc_left"])  # placeholder
    rh_labels = load_surf_data(fsaverage["sulc_right"])

    # Actually load the Destrieux parcellation
    # The atlas provides labels per vertex on fsaverage5
    try:
        from nilearn.datasets import load_fsaverage_data

        lh_destrieux = load_fsaverage_data(
            mesh_name="fsaverage5",
            data_type="sulcal",  # will try parcellation
        )
    except Exception:
        pass

    # Build region map from Destrieux atlas
    # Destrieux atlas maps vertex indices to region labels
    region_map = {}

    try:
        # Try loading parcellation directly
        from nilearn.surface import vol_to_surf
        from nilearn.datasets import fetch_atlas_destrieux_2009

        atlas = fetch_atlas_destrieux_2009()

        # The Destrieux atlas in nilearn provides a volume-based atlas
        # For surface-based labels, we use the fsaverage annotation files
        import nibabel as nib

        # FreeSurfer annotation files for Destrieux on fsaverage5
        from nilearn.datasets import load_fsaverage

        fsavg = load_fsaverage(mesh_name="fsaverage5")

        # Try to find annotation files
        annot_path_lh = None
        annot_path_rh = None

        # Check if nilearn provides them
        data_dir = Path(fsavg["pial_left"]).parent
        for p in data_dir.rglob("*destrieux*"):
            if "lh" in str(p):
                annot_path_lh = str(p)
            elif "rh" in str(p):
                annot_path_rh = str(p)

        if annot_path_lh and annot_path_rh:
            lh_labels_arr, lh_ctab, lh_names = nib.freesurfer.read_annot(
                annot_path_lh
            )
            rh_labels_arr, rh_ctab, rh_names = nib.freesurfer.read_annot(
                annot_path_rh
            )

            # Build region map
            all_labels = np.concatenate([lh_labels_arr, rh_labels_arr])
            all_names = [
                n.decode("utf-8") if isinstance(n, bytes) else n for n in lh_names
            ]

            for i, name in enumerate(all_names):
                if name == "Unknown" or name == "Medial_wall":
                    continue
                indices = np.where(all_labels == i)[0].tolist()
                if len(indices) > 0:
                    region_map[name] = indices

            print(f"Regions: {len(region_map)}")
        else:
            print("WARNING: Destrieux annotation files not found.")
            print("Region map will be empty. Run on a machine with FreeSurfer data.")

    except Exception as e:
        print(f"WARNING: Could not load Destrieux parcellation: {e}")
        print("Region map will be empty.")

    # Build output JSON
    mesh_data = {
        "vertices": vertices.tolist(),
        "faces": faces.tolist(),
        "regionMap": {k: v for k, v in region_map.items()},
    }

    # Write to public/data/mesh.json
    out_dir = Path(__file__).parent.parent / "frontend" / "public" / "data"
    out_dir.mkdir(parents=True, exist_ok=True)
    out_path = out_dir / "mesh.json"

    with open(out_path, "w") as f:
        json.dump(mesh_data, f)

    file_size_mb = out_path.stat().st_size / 1024 / 1024
    print(f"Written: {out_path} ({file_size_mb:.1f} MB)")
    print(f"Vertex count: {len(mesh_data['vertices'])}")
    print(f"Face count: {len(mesh_data['faces'])}")
    print(f"Region count: {len(mesh_data['regionMap'])}")


if __name__ == "__main__":
    export_mesh()
