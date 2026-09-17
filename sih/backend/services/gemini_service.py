import os
import logging
from typing import Optional
from schemas.schemas import (
    PredictionResult, 
    QualityMetrics, 
    ReliabilityResult, 
    GeminiExplanation,
    DR_SUSPECTED_LABELS
)

logger = logging.getLogger("ruraleye.gemini")

# Curated high-fidelity bilingual clinical translations when Gemini API key is offline
FALLBACK_EXPLANATIONS = {
    0: {
        "en_summary": "The retinal screening model observed a healthy fundus pattern with normal optic disc margins and intact vascular integrity. No signs of diabetic microvascular damage were identified.",
        "ta_summary": "விழித்திரை ஆய்வில் நரம்பு வட்டு விளிம்புகள் மற்றும் இரத்த நாளங்கள் சாதாரணமாக உள்ளன. சர்க்கரை நோயினால் ஏற்படும் விழித்திரை பாதிப்புக்கான (DR) அறிகுறிகள் எதுவும் காணப்படவில்லை.",
        "patient_en": "Your retinal scan shows no signs of diabetic retinopathy. Maintain strict glycemic and blood pressure control. Schedule your next annual routine screening in 12 months.",
        "patient_ta": "உங்கள் விழித்திரையில் சர்க்கரை நோய் பாதிப்பு எதுவும் இல்லை. இரத்த சர்க்கரை மற்றும் இரத்த அழுத்தத்தை சீராக பராமரிக்கவும். 12 மாதங்களுக்குப் பிறகு வழக்கமான மறுபரிசோதனை செய்யவும்.",
        "clinical_en": "Fundus examination shows sharp macular architecture, absence of microaneurysms, blot hemorrhages, or lipid exudates. Annual rescreening advised."
    },
    1: {
        "en_summary": "Mild diabetic retinopathy is suspected based on isolated microvascular alterations (early microaneurysms). The overall retinal architecture remains largely intact.",
        "ta_summary": "ஆரம்ப நிலை சர்க்கரை நோய் விழித்திரை பாதிப்பு (Mild DR) இருப்பது சந்தேகிக்கப்படுகிறது. இரத்த நாளங்களில் சிறிய வீக்கங்கள் (microaneurysms) மட்டுமே தென்படுகின்றன.",
        "patient_en": "Early minor microvascular changes were noted. Immediate lifestyle and diet discipline with HbA1c monitoring are strongly recommended. Follow up with an ophthalmologist in 6 to 9 months.",
        "patient_ta": "ஆரம்ப நிலை சிறிய இரத்த நாள மாற்றங்கள் கண்டறியப்பட்டுள்ளன. இரத்த சர்க்கரை அளவை (HbA1c) தீவிரமாக கட்டுக்குள் வைக்க வேண்டும். 6-9 மாதங்களில் கண் மருத்துவரிடம் பரிசோதனை செய்யவும்.",
        "clinical_en": "Early NPDR features: subtle microaneurysms detected in parafoveal zone without clinically significant macular edema (CSME). Semiannual ophthalmic evaluation recommended."
    },
    2: {
        "en_summary": "Moderate non-proliferative diabetic retinopathy is suspected. The neural network identified focal regions consistent with microaneurysms, intraretinal hemorrhages, or lipid exudation.",
        "ta_summary": "மிதமான சர்க்கரை நோய் விழித்திரை பாதிப்பு (Moderate DR) இருப்பது சந்தேகிக்கப்படுகிறது. விழித்திரையில் சிறிய இரத்தக் கசிவுகள் அல்லது கொழுப்புப் படிவுகள் தென்படுகின்றன.",
        "patient_en": "Noticeable retinal changes from diabetes were detected. You should consult an eye specialist (Ophthalmologist) within 2 to 4 weeks for detailed dilated examination and care planning.",
        "patient_ta": "சர்க்கரை நோயால் விழித்திரையில் குறிப்பிடத்தக்க மாற்றங்கள் ஏற்பட்டுள்ளன. விரிவான பரிசோதனைக்காக 2 முதல் 4 வாரங்களுக்குள் கண் மருத்துவரை நேரில் அணுகவும்.",
        "clinical_en": "Moderate NPDR characterized by multiple retinal blot hemorrhages, cotton wool spots, and hard exudates. Prompt dilated fundus examination and OCT referral indicated."
    },
    3: {
        "en_summary": "Severe non-proliferative diabetic retinopathy is suspected. Multiple vascular abnormalities including extensive blot hemorrhages and venous beading were flagged by the model.",
        "ta_summary": "தீவிர சர்க்கரை நோய் விழித்திரை பாதிப்பு (Severe DR) சந்தேகிக்கப்படுகிறது. பல பகுதிகளில் இரத்தக் கசிவுகள் மற்றும் இரத்த நாள மாற்றங்கள் காணப்படுகின்றன.",
        "patient_en": "Significant retinal damage has been detected that requires urgent specialist attention. Please visit an eye hospital or ophthalmologist within 1 to 2 weeks to safeguard vision.",
        "patient_ta": "விழித்திரையில் தீவிர பாதிப்பு ஏற்பட்டுள்ளது. பார்வையை பாதுகாக்க 1 முதல் 2 வாரங்களுக்குள் அரசு அல்லது சிறப்பு கண் மருத்துவமனைக்கு நேரில் செல்ல வேண்டும்.",
        "clinical_en": "Severe NPDR satisfying the 4-2-1 international grading rule (extensive 4-quadrant hemorrhages / venous changes). Urgent retina specialist consultation for potential anti-VEGF or laser evaluation."
    },
    4: {
        "en_summary": "Proliferative diabetic retinopathy (PDR) is suspected. High-risk features such as potential neovascularization or pre-retinal fibrous proliferation were highlighted.",
        "ta_summary": "மிகத் தீவிரமான விழித்திரை பாதிப்பு (Proliferative DR) சந்தேகிக்கப்படுகிறது. புதிய பலவீனமான இரத்த நாளங்கள் அல்லது தீவிர இரத்தக் கசிவுகள் காணப்படலாம்.",
        "patient_en": "High-risk advanced diabetic changes detected. Urgent consultation at an eye hospital within 24 to 48 hours is vital to prevent irreversible vision impairment.",
        "patient_ta": "அவசர கண் பரிசோதனை தேவைப்படும் அதிதீவிர பாதிப்பு. பார்வை இழப்பைத் தடுக்க 24 முதல் 48 மணி நேரத்திற்குள் கண் மருத்துவ நிபுணரை உடனடியாக அணுகவும்.",
        "clinical_en": "Critical PDR presentation: High risk for vitreous hemorrhage and retinal detachment. Immediate vitreo-retinal referral for pan-retinal photocoagulation (PRP) / surgical intervention."
    }
}

def generate_clinical_explanation(
    prediction: PredictionResult,
    quality: QualityMetrics,
    reliability: ReliabilityResult,
    attention_summary: str = ""
) -> GeminiExplanation:
    api_key = os.getenv("GEMINI_API_KEY", "").strip()
    cls_idx = prediction.predicted_class
    fallback = FALLBACK_EXPLANATIONS.get(cls_idx, FALLBACK_EXPLANATIONS[2])

    if not api_key:
        logger.info("GEMINI_API_KEY not configured. Providing high-fidelity structured bilingual clinical template.")
        return GeminiExplanation(
            english_summary=fallback["en_summary"],
            tamil_summary=fallback["ta_summary"],
            patient_guidance_en=fallback["patient_en"],
            patient_guidance_ta=fallback["patient_ta"],
            clinical_note_en=fallback["clinical_en"],
            source="curated_clinical_protocol"
        )

    try:
        from google import genai
        client = genai.Client(api_key=api_key)

        prompt = f"""
You are an expert ophthalmic clinical assistant for the RuralEye AI medical screening system in rural India.
The patient underwent automated retinal fundus screening.
NOTE: Do NOT make a new diagnosis. Explain the given model findings clearly and with medical prudence.

FINDINGS:
- Predicted Screening Result: {prediction.suspected_label} (Class {cls_idx}: {prediction.class_name})
- Confidence: {prediction.confidence_percentage}%
- Image Quality: {quality.status.value} (Blur: {quality.blur_score}/100, Contrast: {quality.contrast_score}/100)
- Reliability Level: {reliability.level} ({reliability.score}/100)
- Explainable AI (Grad-CAM) Observation: {attention_summary}

Please provide a JSON response with the following keys:
1. english_summary: A 2-sentence medical screening summary in English.
2. tamil_summary: A 2-sentence clear explanation in Tamil (தமிழ்).
3. patient_guidance_en: Empathetic, actionable next steps for the patient in English.
4. patient_guidance_ta: Empathetic, actionable next steps for the patient in Tamil (தமிழ்).
5. clinical_note_en: A concise professional note for the reviewing ophthalmologist.

Always clarify that this is an AI screening decision-support output requiring licensed doctor review.
Return ONLY valid JSON.
"""
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
        )
        import json
        text = response.text.strip()
        if text.startswith("```json"):
            text = text[7:]
        if text.endswith("```"):
            text = text[:-3]
        data = json.loads(text)

        return GeminiExplanation(
            english_summary=data.get("english_summary", fallback["en_summary"]),
            tamil_summary=data.get("tamil_summary", fallback["ta_summary"]),
            patient_guidance_en=data.get("patient_guidance_en", fallback["patient_en"]),
            patient_guidance_ta=data.get("patient_guidance_ta", fallback["patient_ta"]),
            clinical_note_en=data.get("clinical_note_en", fallback["clinical_en"]),
            source="gemini-flash"
        )
    except Exception as e:
        logger.warning(f"Gemini API request failed ({e}). Utilizing fallback clinical explanation.")
        return GeminiExplanation(
            english_summary=fallback["en_summary"],
            tamil_summary=fallback["ta_summary"],
            patient_guidance_en=fallback["patient_en"],
            patient_guidance_ta=fallback["patient_ta"],
            clinical_note_en=fallback["clinical_en"],
            source="curated_clinical_protocol_fallback"
        )
