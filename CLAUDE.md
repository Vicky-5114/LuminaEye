# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an AI-powered smart glasses navigation system for the visually impaired (智能盲人眼镜系统). It provides real-time navigation assistance including blind path navigation, crosswalk assistance, traffic light detection, and item search with voice interaction.

**Language**: Chinese (中文) - All UI, voice prompts, and documentation are in Chinese.

**Purpose**: This is an educational/research project for learning and communication. It is NOT intended for direct use by visually impaired individuals without significant safety validation.

**System Requirements**:
- Python 3.9 - 3.11
- CUDA 11.8+ with NVIDIA GPU (strongly recommended, RTX 3060+)
- 8GB+ RAM (16GB recommended)
- 10GB+ disk space for model files

## Architecture

The system follows a layered architecture with FastAPI as the web server:

```
Client Layer (ESP32-CAM, Browser, Mobile)
              ↕ WebSocket/HTTP
FastAPI Service (app_main.py)
  - WebSocket endpoints: /ws/camera, /ws/viewer, /ws_audio
  - HTTP endpoints: /stream.wav, /api/*
              ↕
NavigationMaster (navigation_master.py) - State Machine
              ↕
Workflow Modules (workflow_blindpath.py, workflow_crossstreet.py, yolomedia.py)
              ↕
AI Services (YOLO, MediaPipe, DashScope API)
```

### State Machine

`navigation_master.py` manages these states:
- `IDLE` - Waiting for commands
- `CHAT` - AI conversation mode (no navigation)
- `BLINDPATH_NAV` - Blind path navigation active
- `SEEKING_CROSSWALK` - Blind path stage: detected crosswalk, aligning/approaching
- `WAIT_TRAFFIC_LIGHT` - At crosswalk, waiting for traffic light (optional/placeholder)
- `CROSSING` - Crossing the street (uses CrossStreetNavigator)
- `SEEKING_NEXT_BLINDPATH` - After crossing, seeking next blind path entrance
- `RECOVERY` - Fallback/recovery when perception is temporarily lost
- `TRAFFIC_LIGHT_DETECTION` - Traffic light detection mode
- `ITEM_SEARCH` - Item search mode (pauses navigation, handled by yolomedia)

### Workflow State Machines

**Blind Path Navigation** (`workflow_blindpath.py`):
- `ONBOARDING` → `ROTATION` (对准盲道) → `TRANSLATION` (平移至中心) → `NAVIGATING`
- `NAVIGATING` → `MANEUVERING_TURN` (转弯检测) → `AVOIDING_OBSTACLE` (避障)
- Uses Lucas-Kanade optical flow for mask stabilization

**Crossing Navigation** (`workflow_crossstreet.py`):
- `SEEKING_CROSSWALK` → `WAIT_TRAFFIC_LIGHT` → `CROSSING` → `SEEKING_NEXT_BLINDPATH`
- Traffic light detection uses HSV color classification with YOLO fallback

**Item Search** (`yolomedia.py`):
- `SEGMENT` (YOLO-E detection) → `CENTER_GUIDE` (居中引导) → `TRACK` (hand tracking) → `FLASH` (grab confirmation)
- Falls back to YOLO-E for unknown item categories

## Key Dependencies

- **Python**: 3.9 - 3.11
- **PyTorch**: 2.0.1 (CUDA 11.8 support)
- **FastAPI**: Web framework
- **Ultralytics**: YOLO models
- **MediaPipe**: Hand landmark detection
- **DashScope**: Alibaba Cloud API for ASR and multimodal chat
- **OpenCV**: Computer vision operations

## Landing Page

A Next.js 16 marketing site lives in `landing/my-app/` with its own `CLAUDE.md`. It is a separate frontend project (cyberpunk HUD-style design) and is **not** the backend monitoring UI. The backend serves its own web UI from `templates/index.html` and `static/`.

**Landing page commands** (run from `landing/my-app/`):
```bash
npm run dev     # localhost:3000
npm run build   # Static export to dist/
npm run lint    # ESLint
```

The landing page also has an `AGENTS.md` with Next.js-specific rules about reading `node_modules/next/dist/docs/` before writing code due to breaking changes in this version.

## Common Commands

### Setup

```bash
# Linux/macOS
chmod +x setup.sh && ./setup.sh

# Windows
setup.bat
```

Both scripts create a virtual environment, install PyTorch (CUDA if available), install requirements, and check for model files.

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

### Debugging/Testing

No formal test suite exists. The README references test files (e.g., `test_traffic_light.py`) that are not currently in the repo. Use the following for ad-hoc debugging:

```bash
# Test trafficlight_detection standalone
python -c "import trafficlight_detection; trafficlight_detection.init_model()"

# Test crosswalk awareness module
python crosswalk_awareness.py

# Enable debug logging in app_main.py
import logging
logging.basicConfig(level=logging.DEBUG)
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
| `obstacle_detector_client.py` | ObstacleDetectorClient wrapper for YOLO-E |
| `qwen_extractor.py` | Chinese-to-English item name extraction |
| `audio_stream.py` | WebSocket audio streaming for `/stream.wav` |
| `audio_compressor.py` | Audio compression utilities |
| `crosswalk_awareness.py` | Standalone crosswalk detection test/utility |
| `utils.py` | Shared CV utilities: optical flow, risk scoring, obstacle name mapping |
| `models.py` | Model loading abstraction (appears to be refactor-in-progress; references `app/cloud/` paths that don't exist in current structure) |
| `compile/` | ESP32 Arduino firmware |
| `model/` | AI model files (downloaded separately) |
| `static/` | Web UI assets (JS, CSS) for backend monitoring UI |
| `templates/` | HTML templates (backend UI, not the landing page) |
| `recordings/` | Saved video/audio recordings |
| `landing/` | Next.js marketing site (separate frontend project) |

## Required Model Files

Place these in `model/` directory (download from ModelScope):
- `yolo-seg.pt` - Blind path segmentation
- `yoloe-11l-seg.pt` - Open vocabulary detection
- `shoppingbest5.pt` - Item recognition
- `trafficlight.pt` - Traffic light detection
- `hand_landmarker.task` - MediaPipe hand model (included)

Model download URL: https://www.modelscope.cn/models/archifancy/AIGlasses_for_navigation

**Note**: `yoloe_backend.py` has a hardcoded Windows path in `DEFAULT_MODEL_PATH`. It falls back to the `YOLOE_MODEL_PATH` env var.

## WebSocket Endpoints

| Endpoint | Purpose | Direction |
|----------|---------|-----------|
| `/ws/camera` | ESP32 camera stream | Upload (binary JPEG) |
| `/ws/viewer` | Browser video display | Broadcast (binary JPEG) |
| `/ws_audio` | ESP32 audio upload | Upload (PCM16) |
| `/ws_ui` | UI status updates | JSON |
| `/ws` | IMU data | JSON |

## Voice Commands (Chinese)

Voice commands are processed in `app_main.py:start_ai_with_text_custom()`. Navigation and AI conversation are mutually exclusive modes.

Navigation control:
- "开始导航" / "盲道导航" → Start blind path navigation (switches from CHAT to BLINDPATH_NAV)
- "停止导航" / "结束导航" → Stop navigation (returns to CHAT mode)
- "开始过马路" / "帮我过马路" → Start crossing mode
- "过马路结束" / "结束过马路" → Stop crossing mode
- "立即通过" / "现在通过" → Force crossing (skip traffic light wait)

Traffic light:
- "检测红绿灯" / "看红绿灯" → Traffic light detection mode
- "停止检测" / "停止红绿灯" → Stop detection

Item search:
- "帮我找一下 [物品]" → Search for item (e.g., "帮我找一下红牛")
  - Extracts item name using regex pattern `(?:^\s*帮我)?\s*找一下\s*(.+?)(?:。|！|？|$)`
  - Maps Chinese to English via `qwen_extractor.py` or local mapping in `utils.py`
  - Pauses navigation, enters ITEM_SEARCH state
- "找到了" / "拿到了" → Confirm item found (resumes previous navigation if any)

AI conversation:
- Any non-command text → Multimodal chat with Qwen-Omni (image + text input, voice output)
- During conversation, system is in CHAT mode (navigation paused)
- Voice output is resampled from 24kHz to 8kHz for ESP32 compatibility

### Navigation Mode Filtering

When in navigation or traffic light detection mode (not CHAT/IDLE), only specific keywords trigger AI conversation. All other voice input is discarded:

Allowed query keywords: `["帮我看", "帮我看下", "帮我找", "找一下", "看看", "识别一下"]`

Navigation control keywords bypass this filter.

## Environment Variables

Create `.env` file with:
```bash
DASHSCOPE_API_KEY=sk-xxxxx          # Required: Alibaba Cloud API key
BLIND_PATH_MODEL=model/yolo-seg.pt   # Optional: Model paths
OBSTACLE_MODEL=model/yoloe-11l-seg.pt
YOLOE_MODEL_PATH=model/yoloe-11l-seg.pt
TTS_INTERVAL_SEC=1.0                 # Optional: Voice prompt interval
ENABLE_TTS=true                      # Optional: Enable/disable TTS

# Navigation tuning
AIGLASS_MASK_MIN_AREA=1500      # Minimum mask area for detection
AIGLASS_MASK_MORPH=3            # Morphological kernel size
AIGLASS_MASK_MISS_TTL=6         # Mask miss tolerance in frames
AIGLASS_PANEL_SCALE=0.65        # Data panel scale factor
AIGLASS_OBS_INTERVAL=15         # Obstacle detection interval (frames)
AIGLASS_CROSSWALK_INTERVAL=4    # Crosswalk detection interval (frames)
```

**Note**: `.env.example` is referenced in setup scripts but does not exist in the repo. Create `.env` manually.

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

## Key Implementation Details

### Threading Model

- **Main thread**: FastAPI event loop, WebSocket handlers
- **YOLO/MediaPipe inference**: Runs in main thread (GPU-bound, must not block)
- **Audio processing**: Separate threads in `audio_player.py` and `asr_core.py`
- **Frame distribution**: `bridge_io.py` uses producer-consumer pattern with `queue.Queue`

### State Transition Rules

State changes include a cooldown period (`COOLDOWN_SEC = 0.6`) to prevent jitter:
```python
self.cooldown_until = time.time() + self.COOLDOWN_SEC
```

Mode switching behavior (`app_main.py`):
1. Starting navigation → stops item search if running
2. Starting item search → saves current nav state, pauses navigation
3. Item found → restores previous nav state (if any)
4. AI conversation → saves nav state, switches to CHAT, restores after

### Audio Format Compatibility

- **Input (ASR)**: PCM 16-bit, 16kHz, mono from ESP32
- **Output (TTS)**: Qwen-Omni generates 24kHz WAV → resampled to 8kHz for ESP32
- Resampling uses `audioop.ratecv()` to preserve pitch while changing rate

### Optical Flow Stabilization

Blind path navigation uses Lucas-Kanade optical flow (`cv2.calcOpticalFlowPyrLK`) to stabilize segmentation masks across frames:
- Configured in `workflow_blindpath.py:FEATURE_PARAMS`
- Reduces mask jitter caused by camera shake

### Item Name Mapping

`utils.py` contains `ITEM_TO_CLASS_MAP` for local Chinese-to-English item name resolution:
```python
{"红牛": "Red_Bull", "AD钙奶": "AD_milk", ...}
```

If no local mapping exists, `qwen_extractor.py` calls Qwen-Turbo API to translate. This is used by `yolomedia.py` to set YOLO-E text classes.

## Extending the System

### Adding a New Voice Command

Edit `app_main.py:start_ai_with_text_custom()`. Add your check before the generic AI conversation fallback:

```python
if "新指令关键词" in user_text:
    # Execute custom logic
    await ui_broadcast_final("[系统] 新功能已启动")
    return
```

If the command should be allowed during navigation mode, also add it to `allowed_keywords`.

### Adding a New Navigation State

1. Add the state constant to `navigation_master.py`
2. Add transition methods (e.g., `start_your_mode()`, `stop_your_mode()`)
3. Add processing logic in `process_frame()` under the state branches
4. Add voice command handling in `app_main.py:start_ai_with_text_custom()`

## Important Notes

- All voice prompts and UI text are in Chinese
- GPU strongly recommended (CUDA 11.8+) for real-time performance
- The system uses threading extensively; use `bridge_io` for thread-safe frame passing
- Model files are NOT in the repo; must download separately from ModelScope
- ESP32 firmware is in `compile/compile.ino`
- `models.py` appears to be a newer/refactored model loading abstraction that may not be fully wired into the current `app_main.py` entry point
