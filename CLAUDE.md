# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an AI-powered smart glasses navigation system for the visually impaired (智能盲人眼镜系统). It provides real-time navigation assistance including blind path navigation, crosswalk assistance, traffic light detection, and item search with voice interaction.

**Language**: Chinese (中文) - All UI, voice prompts, and documentation are in Chinese.

## Architecture

The system follows a layered architecture with FastAPI as the web server:

```
┌─────────────────────────────────────────────────────────────┐
│  Client Layer (ESP32-CAM, Browser, Mobile)                  │
└─────────────────────────────────────────────────────────────┘
                              ↕ WebSocket/HTTP
┌─────────────────────────────────────────────────────────────┐
│  FastAPI Service (app_main.py)                              │
│  - WebSocket endpoints: /ws/camera, /ws/viewer, /ws_audio   │
│  - HTTP endpoints: /stream.wav, /api/*                      │
└─────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────┐
│  NavigationMaster (navigation_master.py) - State Machine    │
│  States: IDLE, CHAT, BLINDPATH_NAV, CROSSING,               │
│          TRAFFIC_LIGHT_DETECTION, ITEM_SEARCH               │
└─────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────┐
│  Workflow Modules                                           │
│  - workflow_blindpath.py: Blind path navigation             │
│  - workflow_crossstreet.py: Crosswalk/zebra crossing        │
│  - yolomedia.py: Item search with hand tracking             │
└─────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────┐
│  AI Services                                                │
│  - YOLO models (segmentation, detection)                    │
│  - MediaPipe (hand tracking)                                │
│  - DashScope API (ASR: Paraformer, Chat: Qwen-Omni)        │
└─────────────────────────────────────────────────────────────┘
```

## Key Dependencies

- **Python**: 3.9 - 3.11
- **PyTorch**: 2.0.1 (CUDA 11.8 support)
- **FastAPI**: Web framework
- **Ultralytics**: YOLO models
- **MediaPipe**: Hand landmark detection
- **DashScope**: Alibaba Cloud API for ASR and multimodal chat
- **OpenCV**: Computer vision operations

## Common Commands

### Setup

```bash
# Linux/macOS
chmod +x setup.sh && ./setup.sh

# Windows
setup.bat
```

### Development

```bash
# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Start the server (runs on http://0.0.0.0:8081)
python app_main.py

# With custom API key
DASHSCOPE_API_KEY=sk-xxxxx python app_main.py
```

### Docker

```bash
# Build and run
docker-compose up --build

# Or with GPU support
docker-compose up -d
```

## Project Structure

| File/Directory | Purpose |
|---------------|---------|
| `app_main.py` | FastAPI entry point, WebSocket routing, model loading |
| `navigation_master.py` | Central state machine for navigation modes |
| `workflow_blindpath.py` | Blind path detection, obstacle avoidance, turn guidance |
| `workflow_crossstreet.py` | Crosswalk detection, traffic light waiting |
| `yolomedia.py` | Item search with YOLO-E + hand tracking |
| `asr_core.py` | Real-time speech recognition via DashScope |
| `omni_client.py` | Qwen-Omni-Turbo multimodal chat client |
| `audio_player.py` | Audio playback management with mixing |
| `bridge_io.py` | Thread-safe frame buffer between capture and processing |
| `sync_recorder.py` | Synchronized audio/video recording |
| `yoloe_backend.py` | YOLO-E backend for open-vocabulary detection |
| `trafficlight_detection.py` | Traffic light color detection (HSV + YOLO) |
| `compile/` | ESP32 Arduino firmware |
| `model/` | AI model files (downloaded separately) |
| `static/` | Web UI assets (JS, CSS) |
| `templates/` | HTML templates |
| `recordings/` | Saved video/audio recordings |

## Required Model Files

Place these in `model/` directory (download from ModelScope):
- `yolo-seg.pt` - Blind path segmentation
- `yoloe-11l-seg.pt` - Open vocabulary detection
- `shoppingbest5.pt` - Item recognition
- `trafficlight.pt` - Traffic light detection
- `hand_landmarker.task` - MediaPipe hand model (included)

Model download URL: https://www.modelscope.cn/models/archifancy/AIGlasses_for_navigation

## WebSocket Endpoints

| Endpoint | Purpose | Direction |
|----------|---------|-----------|
| `/ws/camera` | ESP32 camera stream | Upload (binary JPEG) |
| `/ws/viewer` | Browser video display | Broadcast (binary JPEG) |
| `/ws_audio` | ESP32 audio upload | Upload (PCM16) |
| `/ws_ui` | UI status updates | JSON |
| `/ws` | IMU data | JSON |

## Voice Commands (Chinese)

Navigation control:
- "开始导航" / "盲道导航" → Start blind path navigation
- "停止导航" / "结束导航" → Stop navigation
- "开始过马路" / "帮我过马路" → Start crossing mode
- "检测红绿灯" / "看红绿灯" → Traffic light detection
- "帮我找一下 [物品]" → Search for item (e.g., "帮我找一下红牛")
- "找到了" / "拿到了" → Confirm item found

## Environment Variables

Create `.env` file with:
```bash
DASHSCOPE_API_KEY=sk-xxxxx          # Required: Alibaba Cloud API key
BLIND_PATH_MODEL=model/yolo-seg.pt   # Optional: Model paths
OBSTACLE_MODEL=model/yoloe-11l-seg.pt
YOLOE_MODEL_PATH=model/yoloe-11l-seg.pt
TTS_INTERVAL_SEC=1.0                 # Optional: Voice prompt interval
ENABLE_TTS=true                      # Optional: Enable/disable TTS
```

## State Machine States

The `NavigationMaster` manages these states:
- `IDLE` - Waiting for commands
- `CHAT` - AI conversation mode (no navigation)
- `BLINDPATH_NAV` - Blind path navigation active
- `CROSSING` - Crossing the street
- `TRAFFIC_LIGHT_DETECTION` - Monitoring traffic lights
- `ITEM_SEARCH` - Searching for specific items

## Frame Processing Pipeline

1. **Capture**: ESP32 sends JPEG frames via `/ws/camera` → `bridge_io.push_raw_jpeg()`
2. **Distribution**: Raw frames queued for processing
3. **Processing**: `NavigationMaster.process_frame()` routes to appropriate workflow
4. **Visualization**: Processed frames sent via `bridge_io.send_vis_bgr()`
5. **Broadcast**: Frames distributed to browser viewers via `/ws/viewer`

## Audio Pipeline

Input (ASR):
- ESP32 mic → `/ws_audio` (PCM16) → `asr_core` → DashScope ASR → text command

Output (TTS):
- Qwen-Omni generates speech → `audio_player` → `/stream.wav` → ESP32 speaker

## Important Notes

- All voice prompts and UI text are in Chinese
- GPU strongly recommended (CUDA 11.8+) for real-time performance
- The system uses threading extensively; use `bridge_io` for thread-safe frame passing
- Model files are NOT in the repo; must download separately
- ESP32 firmware is in `compile/compile.ino`
