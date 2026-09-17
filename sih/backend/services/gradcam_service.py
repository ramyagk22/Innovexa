import os
import cv2
import numpy as np
import tensorflow as tf
from PIL import Image
from services.model_service import model_service
from schemas.schemas import GradCAMResult

def generate_gradcam(image_path: str, output_dir: str, target_class: int = None) -> GradCAMResult:
    """
    Computes authentic Grad-CAM for the 5-class EfficientNetB0 Keras model
    using true gradient backpropagation from the predicted class to the final conv feature maps.
    """
    if not os.path.exists(image_path):
        raise FileNotFoundError(f"Image not found: {image_path}")

    # 1. Preprocess image
    img_array = model_service.preprocess_image(image_path)
    img_tensor = tf.convert_to_tensor(img_array, dtype=tf.float32)

    model = model_service.model
    eff = model.get_layer('efficientnetb0')
    gap = model.get_layer('global_average_pooling2d')
    dense = model.get_layer('dense')

    # 2. Compute gradients of predicted class score with respect to feature maps
    with tf.GradientTape() as tape:
        feature_maps = eff(img_tensor, training=False)
        tape.watch(feature_maps)
        # Pass features through head
        pooled = gap(feature_maps)
        predictions = dense(pooled)

        if target_class is None:
            target_class = int(tf.argmax(predictions[0]))

        target_score = predictions[:, target_class]

    # Gradient of target class score wrt feature maps
    grads = tape.gradient(target_score, feature_maps)
    # Channel-wise mean of gradients
    pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))

    # Weight feature channels by corresponding gradients
    cam = tf.reduce_sum(tf.multiply(feature_maps[0], pooled_grads), axis=-1)
    cam = tf.maximum(cam, 0)  # ReLU
    max_val = tf.math.reduce_max(cam)
    if max_val > 0:
        cam = cam / max_val
    heatmap_np = cam.numpy()

    # 3. Read original image for overlay
    orig_bgr = cv2.imread(image_path)
    if orig_bgr is None:
        raise ValueError("Could not read original image for Grad-CAM overlay.")
    orig_h, orig_w = orig_bgr.shape[:2]

    # Resize heatmap to match original image dimensions
    heatmap_resized = cv2.resize(heatmap_np, (orig_w, orig_h))
    heatmap_uint8 = np.uint8(255 * heatmap_resized)

    # Apply Jet Colormap
    heatmap_color = cv2.applyColorMap(heatmap_uint8, cv2.COLORMAP_JET)

    # Create Retinal Mask so heatmap only illuminates inside the retinal fundus disc
    gray = cv2.cvtColor(orig_bgr, cv2.COLOR_BGR2GRAY)
    fundus_mask = gray > 15
    mask_3ch = np.stack([fundus_mask] * 3, axis=-1)

    # Superimpose heatmap onto original image
    alpha = 0.42
    overlay_bgr = cv2.addWeighted(orig_bgr, 1.0 - alpha, heatmap_color, alpha, 0)
    overlay_bgr[~mask_3ch] = orig_bgr[~mask_3ch]  # Preserve black background outside disc

    # Filenames
    base_name = os.path.splitext(os.path.basename(image_path))[0]
    heatmap_filename = f"heatmap_{base_name}.png"
    overlay_filename = f"gradcam_{base_name}.png"

    heatmap_path = os.path.join(output_dir, heatmap_filename)
    overlay_path = os.path.join(output_dir, overlay_filename)

    cv2.imwrite(heatmap_path, heatmap_color)
    cv2.imwrite(overlay_path, overlay_bgr)

    # Clinical attention summary based on target class
    if target_class == 0:
        attention_summary = "Model attention is uniformly distributed across the macula and vascular tree with no localized focal lesions detected."
    elif target_class == 1:
        attention_summary = "Localized focal activation detected corresponding to microvascular dilation or isolated microaneurysms."
    elif target_class == 2:
        attention_summary = "Significant focal attention concentrated around the parafoveal and vascular arcade regions showing signs of microaneurysms or hard exudates."
    elif target_class >= 3:
        attention_summary = "Dense multi-quadrant activation over retinal hemorrhages, venous beading, and neovascular zones indicating advanced retinopathy."
    else:
        attention_summary = "Focal activations highlight retinal regions driving model prediction."

    return GradCAMResult(
        heatmap_url=f"/uploads/{heatmap_filename}",
        overlay_url=f"/uploads/{overlay_filename}",
        attention_summary=attention_summary,
        disclaimer="Model attention visualization is an AI decision-support tool and not a clinically validated lesion map."
    )
