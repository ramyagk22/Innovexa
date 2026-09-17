import os
import logging
import numpy as np
from PIL import Image
from typing import Optional, List, Dict, Any

# Ensure TensorFlow backend for Keras 3
os.environ["KERAS_BACKEND"] = "tensorflow"
import keras
import tensorflow as tf

from schemas.schemas import (
    PredictionResult, 
    ClassProbability, 
    DR_CLASS_LABELS, 
    DR_SUSPECTED_LABELS
)

logger = logging.getLogger("ruraleye.model")

class DRModelService:
    _instance: Optional['DRModelService'] = None
    _model: Optional[keras.Model] = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(DRModelService, cls).__new__(cls)
            cls._instance._load_model()
        return cls._instance

    def _load_model(self):
        model_path = os.getenv("MODEL_PATH", "backend/models/final_model.keras")
        # Handle relative path from backend or root
        possible_paths = [
            model_path,
            os.path.join(os.path.dirname(__file__), "..", "models", "final_model.keras"),
            "backend/models/final_model.keras",
            "models/final_model.keras"
        ]

        found_path = None
        for p in possible_paths:
            if os.path.exists(p):
                found_path = p
                break

        if not found_path:
            logger.error(f"FATAL: Diabetic Retinopathy model file not found! Looked in: {possible_paths}")
            raise FileNotFoundError(f"Model file not found at {model_path}. Please place final_model.keras at backend/models/final_model.keras")

        logger.info(f"Loading trained Diabetic Retinopathy model from {found_path}...")
        try:
            self._model = keras.models.load_model(found_path, compile=False)
            logger.info(f"DR Model loaded successfully. Input: {self._model.input_shape}, Output: {self._model.output_shape}")
        except Exception as e:
            logger.error(f"Error loading final_model.keras: {e}")
            raise RuntimeError(f"Failed to load final_model.keras: {e}")

    @property
    def model(self) -> keras.Model:
        if self._model is None:
            self._load_model()
        return self._model

    def preprocess_image(self, image_path: str) -> np.ndarray:
        if not os.path.exists(image_path):
            raise FileNotFoundError(f"Image not found: {image_path}")

        # Open image and convert to RGB
        img = Image.open(image_path).convert("RGB")
        # Resize to model input shape 224x224
        img = img.resize((224, 224), Image.Resampling.BILINEAR)
        # Convert to float32 array in [0, 255] (the model's internal Rescaling/Normalization handles standard EfficientNet scaling)
        img_array = np.array(img, dtype=np.float32)
        # Expand dims to batch (1, 224, 224, 3)
        img_array = np.expand_dims(img_array, axis=0)
        return img_array

    def predict(self, image_path: str) -> PredictionResult:
        """Run authentic inference with the real Keras 5-class DR model"""
        img_array = self.preprocess_image(image_path)
        
        # Run model inference (fast tensor execution without rebuilding graph)
        predictions = self.model(img_array, training=False)
        probs = tf.nn.softmax(predictions).numpy()[0] if predictions.shape[-1] == 5 and not np.isclose(np.sum(predictions.numpy()[0]), 1.0, atol=1e-2) else predictions.numpy()[0]

        # Ensure probabilities sum to 1.0
        probs = probs.astype(float)
        total = np.sum(probs)
        if total > 0:
            probs = probs / total

        predicted_class = int(np.argmax(probs))
        confidence = float(probs[predicted_class])

        class_probabilities: List[ClassProbability] = []
        for i in range(5):
            prob = float(probs[i])
            class_probabilities.append(ClassProbability(
                class_index=i,
                class_name=DR_CLASS_LABELS.get(i, f"Grade {i}"),
                suspected_label=DR_SUSPECTED_LABELS.get(i, f"Grade {i} Suspected"),
                probability=round(prob, 4),
                percentage=round(prob * 100.0, 1)
            ))

        return PredictionResult(
            predicted_class=predicted_class,
            class_name=DR_CLASS_LABELS.get(predicted_class, "Unknown"),
            suspected_label=DR_SUSPECTED_LABELS.get(predicted_class, "Unknown"),
            confidence=round(confidence, 4),
            confidence_percentage=round(confidence * 100.0, 1),
            probabilities=class_probabilities
        )

# Global singleton
model_service = DRModelService()
