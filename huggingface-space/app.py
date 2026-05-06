"""
ORHUN AI — ACE-Step 1.5 HuggingFace Space
This file runs on HuggingFace's free ZeroGPU (A100).

Deploy steps:
1. Create new HF Space → SDK: Gradio → Hardware: ZeroGPU
2. Upload this file as app.py
3. Upload requirements.txt
4. Wait for build (~15 min first time)
5. Test in browser, then use API endpoint from backend
"""

import os
import torch
import gradio as gr
import spaces  # ZeroGPU decorator
from acestep.pipeline_ace_step import ACEStepPipeline

# ============================================================
# Model loading (CPU'da yuklab keyin GPU'ga ko'chiriladi)
# ============================================================
print("Loading ACE-Step 1.5 model...")
pipeline = ACEStepPipeline(
    checkpoint_dir=None,  # auto-download from HF
    dtype="bfloat16",
    torch_compile=False,
    device_id=0,
)
print("Model ready.")


# ============================================================
# Generation function (ZeroGPU decorator bilan)
# ============================================================
@spaces.GPU(duration=120)  # 2 daqiqa GPU vaqti
def generate_song(
    prompt: str,
    lyrics: str = "",
    duration: int = 180,  # sekundlarda (3 daqiqa default)
    voice_type: str = "female",  # male/female/instrumental
    genres: str = "",
    seed: int = -1,
):
    """
    Promtdan qo'shiq yaratadi.
    
    Args:
        prompt: Musiqa stilini tasvirlovchi matn
        lyrics: Qo'shiq matni (ixtiyoriy, instrumental bo'lsa bo'sh)
        duration: Davomiyligi sekundlarda (60-240)
        voice_type: male/female/instrumental
        genres: Janrlar vergul bilan ajratilgan ("pop, rock")
        seed: -1 random, aks holda fixed
    
    Returns:
        audio file path (Gradio avtomatik URL'ga aylantiradi)
    """
    
    # Promtni boyitish
    full_prompt_parts = []
    if genres:
        full_prompt_parts.append(genres)
    if voice_type == "instrumental":
        full_prompt_parts.append("instrumental, no vocals")
    elif voice_type == "male":
        full_prompt_parts.append("male vocals")
    elif voice_type == "female":
        full_prompt_parts.append("female vocals")
    full_prompt_parts.append(prompt)
    
    final_prompt = ", ".join(full_prompt_parts)
    
    # Instrumental rejimi uchun lirikani tozalash
    if voice_type == "instrumental":
        lyrics = "[instrumental]"
    elif not lyrics.strip():
        lyrics = "[instrumental]"
    
    # Generation
    audio_path = pipeline(
        prompt=final_prompt,
        lyrics=lyrics,
        audio_duration=duration,
        infer_step=27,
        guidance_scale=15,
        scheduler_type="euler",
        cfg_type="apg",
        manual_seeds=str(seed) if seed >= 0 else None,
    )
    
    return audio_path


# ============================================================
# Gradio interface
# ============================================================
with gr.Blocks(title="Orhun AI — ACE-Step Music Generator", theme=gr.themes.Soft()) as demo:
    gr.Markdown(
        """
        # 🎵 Orhun AI Music Generator
        Powered by ACE-Step 1.5 on ZeroGPU (A100).
        
        **Backend uchun API endpoint:** `/run/generate_song`
        """
    )
    
    with gr.Row():
        with gr.Column():
            prompt_input = gr.Textbox(
                label="Music style prompt",
                placeholder="upbeat pop song with synth and drums",
                lines=2,
            )
            lyrics_input = gr.Textbox(
                label="Lyrics (optional)",
                placeholder="[verse]\nDancing under stars tonight\n...",
                lines=6,
            )
            with gr.Row():
                voice_type = gr.Radio(
                    choices=["male", "female", "instrumental"],
                    value="female",
                    label="Voice type",
                )
                duration = gr.Slider(
                    minimum=60,
                    maximum=240,
                    value=180,
                    step=10,
                    label="Duration (seconds)",
                )
            genres_input = gr.Textbox(
                label="Genres (comma separated)",
                placeholder="pop, electronic",
            )
            seed_input = gr.Number(value=-1, label="Seed (-1 = random)")
            
            generate_btn = gr.Button("🎵 Generate Song", variant="primary")
        
        with gr.Column():
            audio_output = gr.Audio(label="Generated Song", type="filepath")
    
    generate_btn.click(
        fn=generate_song,
        inputs=[prompt_input, lyrics_input, duration, voice_type, genres_input, seed_input],
        outputs=audio_output,
        api_name="generate_song",  # Bu API endpoint nomi
    )
    
    gr.Examples(
        examples=[
            ["upbeat pop song with electric guitar", "[verse]\nWalking down the street tonight\nFeeling everything is right\n[chorus]\nThis is our moment, this is our time", 180, "female", "pop", -1],
            ["calm lofi beats for studying", "", 120, "instrumental", "lofi, ambient", -1],
            ["epic orchestral cinematic music", "", 180, "instrumental", "classical, cinematic", -1],
        ],
        inputs=[prompt_input, lyrics_input, duration, voice_type, genres_input, seed_input],
    )


if __name__ == "__main__":
    demo.queue(max_size=10).launch()
