---
title: Orhun AI Music Generator
emoji: 🎵
colorFrom: blue
colorTo: indigo
sdk: gradio
sdk_version: 4.44.0
app_file: app.py
pinned: false
license: apache-2.0
short_description: ACE-Step 1.5 music generation for Orhun AI platform
hardware: zero-a10g
---

# Orhun AI — Music Generator (ACE-Step 1.5)

This Space powers the AI music generation backend for [Orhun AI](https://orhun-ai.vercel.app).

## Model
- **ACE-Step 1.5** by ace-step team
- Apache 2.0 license — commercial use allowed
- Runs on HuggingFace ZeroGPU (NVIDIA A10G/A100)

## API Usage (from backend)

```python
from gradio_client import Client

client = Client("YOUR-USERNAME/orhun-acestep")
result = client.predict(
    prompt="upbeat pop song",
    lyrics="[verse]\nHello world\n",
    duration=180,
    voice_type="female",
    genres="pop, electronic",
    seed=-1,
    api_name="/generate_song"
)
print(result)  # path to audio file
```

## Notes
- First request after idle may take longer (cold start)
- ZeroGPU has rate limits on free tier
- For production, upgrade to HF PRO ($9/mo) or use Modal/Replicate as fallback
