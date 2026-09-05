import os
import json
import httpx
from typing import Dict, Any, List
from backend.config import DISCLAIMER_TEXT, LLM_API_KEY, LLM_PROVIDER

def _call_free_llm(prompt: str) -> str:
    """
    Calls a free LLM provider (Groq / Gemini / Ollama / OpenRouter free tier) if configured.
    Falls back gracefully to rule-based explanation if no key is provided or request fails.
    """
    provider = (LLM_PROVIDER or "groq").lower()
    api_key = LLM_API_KEY or os.getenv("GROQ_API_KEY") or os.getenv("GEMINI_API_KEY")

    if not api_key and provider != "ollama":
        return None

    try:
        if "groq" in provider:
            # Free Groq API (e.g. llama-3.1-8b-instant)
            headers = {
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json"
            }
            payload = {
                "model": "llama-3.1-8b-instant",
                "messages": [
                    {
                        "role": "system",
                        "content": "You are an AI decision support assistant for government Forest Rights Act (FRA) monitoring officers. Provide a concise, clear 2-sentence executive summary explanation of the detected claim anomalies and recommended next steps."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                "temperature": 0.2,
                "max_tokens": 150
            }
            with httpx.Client(timeout=4.0) as client:
                res = client.post("https://api.groq.com/openai/v1/chat/completions", json=payload, headers=headers)
                if res.status_code == 200:
                    data = res.json()
                    return data["choices"][0]["message"]["content"].strip()

        elif "gemini" in provider:
            # Free Google Gemini API
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
            payload = {
                "contents": [{
                    "parts": [{"text": f"You are an FRA Forest Rights monitoring AI assistant. Summarize these anomalies in 2 clear sentences for an official:\n{prompt}"}]
                }]
            }
            with httpx.Client(timeout=4.0) as client:
                res = client.post(url, json=payload)
                if res.status_code == 200:
                    data = res.json()
                    return data["candidates"][0]["content"]["parts"][0]["text"].strip()

        elif "ollama" in provider:
            # Local free Ollama
            ollama_url = os.getenv("OLLAMA_URL", "http://localhost:11434/api/generate")
            payload = {
                "model": "llama3",
                "prompt": f"You are an FRA decision support assistant. Summarize these claim anomalies in 2 sentences for a government official:\n{prompt}",
                "stream": False
            }
            with httpx.Client(timeout=3.0) as client:
                res = client.post(ollama_url, json=payload)
                if res.status_code == 200:
                    return res.json().get("response", "").strip()

    except Exception as e:
        # Graceful fallback to rule-based summary
        pass

    return None

def generate_ai_explanation(claim: Dict[str, Any], anomalies: List[Dict[str, Any]]) -> str:
    """
    Generates plain-language, explainable AI executive summary for a claim.
    Combines free LLM generation with robust rule-based synthesis fallback.
    """
    if not anomalies:
        return f"Claim {claim.get('claim_id', '')} has passed automated compliance checks. No anomalies or risk indicators were detected."

    # Build prompt for free LLM
    anomaly_descriptions = []
    explanations = []

    for anomaly in anomalies:
        a_type = anomaly.get("anomaly_type")
        sev = anomaly.get("severity", "MEDIUM")
        reason = anomaly.get("reason", "")
        anomaly_descriptions.append(f"- {a_type} ({sev} Risk): {reason}")

        if a_type == "Land Record Mismatch":
            c_area = claim.get("claimed_area", 0.0)
            r_area = claim.get("recorded_area", 0.0)
            explanations.append(
                f"[{sev} RISK] Land Record Mismatch: The claimed land area is {c_area:.2f} hectares while official recorded area is {r_area:.2f} hectares, indicating a significant discrepancy."
            )
        elif a_type == "Delayed Claim":
            days = claim.get("days_pending", 0)
            explanations.append(
                f"[{sev} RISK] Delayed Claim: This claim has been pending for {days} days, exceeding the normal monitoring timeline and requiring priority administrative intervention."
            )
        elif a_type == "Missing Information":
            explanations.append(
                f"[{sev} RISK] Missing Information: Required documentation or field entries are incomplete for this claim submission."
            )
        elif a_type == "Duplicate Claim":
            explanations.append(
                f"[{sev} RISK] Duplicate Registration: Claim ID {claim.get('claim_id')} shares identical identifiers with an existing record."
            )
        elif a_type == "Unusual Processing Time":
            days = claim.get("days_pending", 0)
            explanations.append(
                f"[{sev} RISK] Unusual Processing Time: Pending duration of {days} days deviates significantly from historical district benchmark averages."
            )
        else:
            explanations.append(f"[{sev} RISK] {a_type}: {reason}")

    prompt_text = (
        f"Claim ID: {claim.get('claim_id')}\n"
        f"Applicant: {claim.get('applicant_name')}\n"
        f"Location: {claim.get('village')}, {claim.get('district')}, {claim.get('state')}\n"
        f"Claimed Area: {claim.get('claimed_area')} ha, Recorded Area: {claim.get('recorded_area')} ha\n"
        f"Days Pending: {claim.get('days_pending')} days\n"
        f"Detected Anomalies:\n" + "\n".join(anomaly_descriptions)
    )

    # Attempt Free LLM generation first
    llm_output = _call_free_llm(prompt_text)
    if llm_output:
        return f"[AI Synthesis via {LLM_PROVIDER or 'Free LLM'}] {llm_output} ({DISCLAIMER_TEXT})"

    # Rule-based synthesis fallback
    summary = " ".join(explanations)
    return f"{summary} ({DISCLAIMER_TEXT})"
