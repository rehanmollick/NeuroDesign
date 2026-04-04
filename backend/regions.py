"""
Destrieux atlas ROI aggregation + static cognitive function lookup.
Loaded once at Modal container startup.
"""

import numpy as np
from typing import Optional

# Static lookup: Destrieux anatomical label -> (display name, cognitive function)
# Only the regions we actually surface in the UI
REGION_FUNCTIONS = {
    "G_oc-temp_lat-fusifor": (
        "Fusiform Gyrus",
        "Processes face recognition and identifying familiar visual objects",
    ),
    "G_oc-temp_med-Lingual": (
        "Lingual Gyrus",
        "Processes visual word recognition and color perception",
    ),
    "S_calcarine": (
        "Primary Visual Cortex",
        "Receives raw visual information from the eyes",
    ),
    "G_cuneus": (
        "Cuneus",
        "Processes basic visual features like edges and motion",
    ),
    "G_front_middle": (
        "Dorsolateral Prefrontal",
        "Working memory and cognitive effort — higher activation means more mental work",
    ),
    "G_front_inf-Orbital": (
        "Orbitofrontal Cortex",
        "Reward evaluation and emotional response to stimuli",
    ),
    "G_and_S_frontomargin": (
        "Frontomarginal Gyrus",
        "Decision-making and evaluating novel information",
    ),
    "G_precuneus": (
        "Precuneus",
        "Self-referential processing and spatial awareness",
    ),
    "G_parietal_sup": (
        "Superior Parietal",
        "Spatial attention — where you direct your gaze",
    ),
    "G_pariet_inf-Angular": (
        "Angular Gyrus",
        "Reading, language comprehension, and semantic memory",
    ),
    "G_pariet_inf-Supramar": (
        "Supramarginal Gyrus",
        "Processing written text and phonological awareness",
    ),
    "G_temp_sup-Lateral": (
        "Superior Temporal",
        "Auditory processing and social perception",
    ),
    "G_temp_sup-G_temp_transv_and_interm_s": (
        "Primary Auditory Cortex",
        "Initial processing of sound — responds to rhythm in visual patterns",
    ),
    "G_temporal_middle": (
        "Middle Temporal",
        "Recognizing objects and processing complex visual scenes",
    ),
    "S_temporal_sup": (
        "Superior Temporal Sulcus",
        "Biological motion and perceiving other people's intentions",
    ),
    "G_cingul-Post-dorsal": (
        "Posterior Cingulate",
        "Default mode — active during passive viewing and mind-wandering",
    ),
    "G_cingul-Post-ventral": (
        "Ventral Posterior Cingulate",
        "Emotional memory and autobiographical recall",
    ),
    "G_insular_short": (
        "Insula",
        "Interoception and emotional salience — gut reactions",
    ),
    "G_occipital_middle": (
        "Middle Occipital",
        "Processing complex visual shapes and object recognition",
    ),
    "G_occipital_sup": (
        "Superior Occipital",
        "Higher-order visual processing and spatial relationships",
    ),
    "G_oc-temp_med-Parahip": (
        "Parahippocampal",
        "Scene recognition and spatial memory encoding",
    ),
    "G_and_S_cingul-Mid-Ant": (
        "Anterior Cingulate",
        "Conflict detection and cognitive control",
    ),
    "S_intrapariet_and_P_trans": (
        "Intraparietal Sulcus",
        "Directs spatial attention and tracks where objects are",
    ),
    "S_postcentral": (
        "Postcentral Sulcus",
        "Processes touch and body awareness signals",
    ),
    "S_oc_sup_and_transversal": (
        "Superior Occipital Sulcus",
        "Connects visual areas for depth and motion processing",
    ),
    "S_occipital_ant": (
        "Anterior Occipital Sulcus",
        "Bridges early vision with higher-level object recognition",
    ),
    "S_oc_middle_and_Lunatus": (
        "Middle Occipital Sulcus",
        "Processes visual contours and shape boundaries",
    ),
    "S_oc-temp_med_and_Lingual": (
        "Occipitotemporal Sulcus",
        "Connects visual processing to word and face recognition",
    ),
    "S_parieto_occipital": (
        "Parieto-Occipital Sulcus",
        "Integrates vision with spatial awareness and navigation",
    ),
    "S_collat_transv_ant": (
        "Anterior Collateral Sulcus",
        "Supports face and scene recognition memory",
    ),
    "S_collat_transv_post": (
        "Posterior Collateral Sulcus",
        "Processes visual scenes and spatial layout",
    ),
    "S_front_middle": (
        "Middle Frontal Sulcus",
        "Executive planning and sustained attention",
    ),
    "S_circular_insula_sup": (
        "Superior Circular Insular Sulcus",
        "Emotional awareness and sensory integration",
    ),
    "S_interm_prim-Jensen": (
        "Intermediate Sulcus",
        "Links auditory and visual processing areas",
    ),
    "S_orbital_lateral": (
        "Lateral Orbital Sulcus",
        "Evaluates reward value and emotional significance",
    ),
    "S_precentral-sup-part": (
        "Superior Precentral Sulcus",
        "Plans eye movements and visual search",
    ),
    "G_precentral": (
        "Precentral Gyrus",
        "Motor planning, responds to action-oriented imagery",
    ),
    "G_and_S_paracentral": (
        "Paracentral Lobule",
        "Motor and sensory processing for lower body",
    ),
    "G_and_S_subcentral": (
        "Subcentral Gyrus",
        "Taste and mouth sensation, responds to food imagery",
    ),
    "G_front_inf-Opercular": (
        "Inferior Frontal Operculum",
        "Language production and interpreting visual meaning",
    ),
    "G_temp_sup-Plan_polar": (
        "Temporal Polar Planum",
        "Processes familiar voices and emotional tone",
    ),
    "G_Ins_lg_and_S_cent_ins": (
        "Long Insular Gyrus",
        "Pain processing and emotional intensity",
    ),
    "G_and_S_occipital_inf": (
        "Inferior Occipital Gyrus",
        "Early visual processing of objects and faces",
    ),
    "Pole_occipital": (
        "Occipital Pole",
        "Sharpest central vision processing, what you look at directly",
    ),
    "Pole_temporal": (
        "Temporal Pole",
        "Links emotions to memories and familiar concepts",
    ),
    "Lat_Fis-ant-Horizont": (
        "Anterior Horizontal Fissure",
        "Separates frontal and temporal language areas",
    ),
    "Lat_Fis-ant-Vertical": (
        "Anterior Vertical Fissure",
        "Boundary between motor and language regions",
    ),
}


def load_region_map(mesh_json_path: str) -> dict[str, list[int]]:
    """Load vertex-to-region mapping from mesh.json."""
    import json
    with open(mesh_json_path) as f:
        mesh = json.load(f)
    return mesh.get("regionMap", {})


def aggregate_regions(
    activations: np.ndarray,
    region_map: dict[str, list[int]],
    top_n: int = 20,
) -> list[dict]:
    """
    Compute per-region mean activations.
    Returns top_n regions sorted by absolute delta (requires both A and B).
    """
    results = []

    for region_name, vertex_indices in region_map.items():
        if not vertex_indices:
            continue

        indices = np.array(vertex_indices)
        # activations is shape (2, n_vertices): [imageA, imageB]
        act_a = float(activations[0, indices].mean())
        act_b = float(activations[1, indices].mean())
        delta = act_b - act_a

        display_name, function_desc = REGION_FUNCTIONS.get(
            region_name,
            (region_name.replace("_", " ").replace("-", " "), "Cortical region"),
        )

        results.append({
            "name": region_name,
            "displayName": display_name,
            "function": function_desc,
            "activationA": act_a,
            "activationB": act_b,
            "delta": delta,
        })

    # Sort by absolute delta, take top_n
    results.sort(key=lambda r: abs(r["delta"]), reverse=True)
    return results[:top_n]
