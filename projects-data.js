/* =====================================================
   Projects content. This is the only file to edit when
   adding or changing projects.

   After editing, run:   node tools/build-projects.mjs
   It writes projects.html (the list), one page per case
   study in projects/<slug>.html, the home page's selected
   work, and sitemap.xml.

   Images live in assets/projects/<slug>/. Every case study
   needs cover.webp (1600x1000) and og.jpg (1200x630).

   Body blocks, in order:
     { h: "Heading" }
     { p: "Paragraph, <b>html</b> allowed" }
     { list: ["item", "item"] }
     { fig: "file.webp", alt, caption, light: true }   light = white paper figure
     { video: "file.mp4", poster: "file.webp", caption }
     { videos: [{ src, poster }], caption }            side-by-side portrait clips
     { code: "preformatted text" }

   Teammates are named only on research projects.
===================================================== */

const CASE_STUDIES = [
  /* ------------------------------------------------ work */
  {
    slug: "padel",
    group: "work",
    title: "Padel Match Analytics",
    kicker: "Layman AI · intern, now Junior AI Engineer",
    year: "2026",
    summary:
      "Turning ordinary padel match footage into the things players and coaches actually ask about: who hit what, where everyone stood, and which points broke the rules.",
    stats: [
      ["78%", "of real hits caught"],
      ["7 of 9", "far-court hits found, up from 1"],
    ],
    facts: [
      ["client", "a padel analytics company, through Layman AI"],
      ["role", "built most of the computer-vision side as an AI/ML intern; still working on it as a Junior AI Engineer"],
      ["timeline", "Jun 2026 - present"],
      ["delivered", "a backend they run themselves, with annotated videos, a tracking replay, charts and spreadsheet-ready data per match"],
      ["stack", "YOLO, TrackNetV3, pose estimation, PyTorch, OpenCV, FastAPI"],
    ],
    links: [],
    hero: {
      img: "overlay.gif",
      alt: "Animated padel rally with court zones, player IDs, rackets, pose and shot labels drawn over the footage",
      caption: "One rally as the client sees it: every player tagged, every hit marked, every shot named.",
    },
    body: [
      { h: "What the client wanted" },
      {
        p: "Padel is filmed constantly, but almost nobody watches the footage twice. The client wanted that footage to become something useful without a person sitting through every rally with a notepad. Upload a match, get back the answers a coach or player would ask for: how many shots each person played, what kind, where they spent the match, how rallies started and ended, and when a point broke the rules. It had to run on their own machines, with their own models, and give results they could trust enough to show to paying players.",
      },
      { h: "What we delivered" },
      {
        p: "A backend the client runs themselves. They hand it a match video and get a folder back, named by date and match, with a short note explaining every file inside. For each match it produces:",
      },
      {
        list: [
          "<b>An annotated match video.</b> Every player keeps the same ID for the whole match, with rackets, body pose, court zones and walls drawn in, and each hit labelled with the shot type.",
          "<b>A clean tracking replay.</b> The match redrawn on a plain court with stick-figure players and the ball's path, easy to read on a phone and free of the camera's clutter.",
          "<b>Shot by shot data.</b> Who hit the ball, when and with which shot (serve, forehand, backhand, smash, bandeja or lob), ready to open in a spreadsheet or feed into an app.",
          "<b>Rallies and rule calls.</b> Where each point started and finished, plus padel-specific faults such as a serve into the fence or a ball hitting the glass before the floor.",
          "<b>Charts.</b> A heatmap of where each player stood, ball speed over the match and each player's mix of shots.",
        ],
      },
      { h: "How it gets used" },
      {
        list: [
          "<b>Players</b> see their own match in numbers: how often they smash, how much they lean on the backhand, and whether they really stay at the net as much as they think.",
          "<b>Coaches</b> jump straight to the moments worth talking about, such as every serve or every lost point, instead of scrubbing through an hour of video. Heatmaps make positioning problems obvious at a glance.",
          "<b>Clubs and the client's app</b> get structured data for every match, so they can track a player over a season, compare players, or build highlight reels automatically.",
        ],
      },
      { h: "Making it trustworthy" },
      {
        p: "The hardest part was making the numbers believable. In an early client demo the system counted hits that never happened. When I went through it frame by frame, more than a third of the hits it reported were the ball simply flying past a racket. I rebuilt the hit detection to look for the ball actually changing direction at a racket, then checked it against a minute of play I had labelled by hand. It now catches <b>78%</b> of real hits, and on the far side of the court, where players look tiny, it finds 7 of 9 hits instead of 1.",
      },
    ],
  },

  /* ------------------------------------------------ research */
  {
    slug: "ndn-anomaly-detection",
    group: "research",
    title: "Catching Attacks in Named Data Networking",
    kicker: "research · journal paper under revision",
    year: "2026",
    summary:
      "One unsupervised Isolation Forest, trained only on clean traffic, that detects two different NDN attacks on emulated and simulated networks.",
    stats: [
      ["89-98%", "attacker detection on the emulated networks"],
      ["44 vs 1.8", "Interests/s: the two attacks' detection floors"],
      ["297", "simulation runs in the attacker-rate sweep"],
    ],
    facts: [
      ["role", "first author: data processing, the detector and the analysis"],
      ["authors", "Ankit Pokhrel, Asmit Phuyal, Darshan Kumar Paudyal, Babu R. Dawadi, Dibakar Raj Pant"],
      ["timeline", "Mar 2026 - present"],
      ["stack", "Python, scikit-learn, miniNDN + NFD, ns-3 / ndnSIM"],
    ],
    links: [{ label: "source", href: "https://github.com/ankitpokhrel08/ndn_research_work", kind: "src" }],
    hero: {
      img: "floor-headline.webp",
      light: true,
      alt: "Chart of attacker detection rate against attacker rate for Cache Pollution and Interest Flooding",
      caption:
        "The paper's central result: the two attacks' detection floors are an order of magnitude apart.",
    },
    body: [
      { h: "The problem" },
      {
        p: "Named Data Networking fetches content by name instead of talking to a host. Routers cache data and keep state for every pending request, which opens two attacks: <b>Interest Flooding</b>, which floods routers with requests for content that doesn't exist, and <b>Cache Pollution</b>, which fills caches with junk. No single threshold rule catches both. We wanted one detector that does, trained without ever seeing an attack.",
      },
      { h: "What we did" },
      {
        p: "One Isolation Forest, trained only on clean traffic, tested on two independent platforms across the same three topologies (tree, dumbbell and a DFN-style mesh): <b>miniNDN</b>, which emulates the network with the real NDN forwarding daemon, and <b>ndnSIM</b>, an ns-3 simulator. On ndnSIM we swept the attacker's rate across 297 runs to find the slowest attack each one can still be caught at. KS hypothesis tests and feature-ablation studies showed which features actually carry each attack.",
      },
      {
        fig: "topologies.webp",
        light: true,
        alt: "Three network topologies: tree, dumbbell and partial mesh",
        caption: "The three topologies, used on both platforms.",
      },
      { h: "The textbook signature wasn't there" },
      {
        p: "The standard story says Interest Flooding blows up a router's Pending Interest Table. In our emulation it didn't: PIT size was statistically the same under attack: the forwarder rejects attack requests with NACKs, and the table drains between polls. The signal was in the NACK rate and the satisfaction ratio instead, which corrects the usual picture of this attack.",
      },
      { h: "The hard part: a model that learned failure was normal" },
      {
        p: "Early on the detector caught almost nothing. The model wasn't the problem. <b>22.6% of our \"normal\" training samples were idle intervals that the logging code recorded as total failure</b>, so the model learned that failure looks normal. With clean data the same model found the attacker 89-98% of the time.",
      },
      {
        p: "A second fix made it robust to load. Absolute rate features flagged busy but healthy traffic as attacks, so we replaced them with ratios.",
      },
      {
        fig: "load-invariance.webp",
        light: true,
        alt: "Bar charts comparing false-positive rate and detection for absolute-rate and ratio features",
        caption:
          "Ratio features cut false positives on a busier normal run from 41% to 2%, without losing detection.",
      },
      { h: "The result: the detection floor" },
      {
        p: "At a realistic false-positive rate of about 2%, Cache Pollution stays detectable down to about <b>44 Interests per second</b> per attacker, while Interest Flooding stays detectable down to about <b>1.8</b>. The floors hold across all three topologies, including ones the model never trained on. Cache Pollution is volumetric, so it has to shout to be seen; Interest Flooding looks different, not just louder.",
      },
      {
        fig: "mechanism.webp",
        light: true,
        alt: "Detection rate against attacker volume as a multiple of legitimate traffic",
        caption: "Interest Flooding is caught at roughly normal volume; Cache Pollution needs about ten times it.",
      },
      {
        p: "So the practical limit of anomaly detection here isn't peak accuracy at one attack rate. It's the floor: how quietly an attacker can operate before the detector loses them. The paper is under revision for a journal.",
      },
    ],
  },
  {
    slug: "midas",
    group: "research",
    title: "MIDAS: When a Road Sign Hijacks the Model",
    kicker: "research · undergraduate major project · ongoing",
    year: "2026",
    summary:
      "Reproducing an attack where one sign in the camera view flips a vision-language model's driving decision, then finding where the hijack lives inside the model.",
    stats: [
      ["100%", "probe accuracy on unseen scenes, from layer 11"],
      ["94.6%", "tells injected commands from ordinary signs"],
      ["1B-8B", "model sizes compared"],
    ],
    facts: [
      ["role", "built the pipeline and ran the experiments"],
      ["team", "with Aayush Ojha and Ankit Raj Mehta · supervised by Assoc. Prof. Dr. Dibakar Raj Pant"],
      ["timeline", "Oct 2026 - present"],
      ["stack", "PyTorch, InternVL2.5 (1B to 8B), DriveLM scenes, linear probes, Kaggle 2x T4"],
    ],
    links: [],
    hero: {
      img: "clean-vs-attacked.webp",
      light: true,
      alt: "The same street scene before and after a red PROCEED sign is added",
      caption: "Same scene, same question. Without the sign the model answers brake; with it, proceed.",
    },
    body: [
      {
        p: "MIDAS is our undergraduate major project, and it's ongoing. We're reproducing CHAI, a published attack where a readable sign in a driving scene (say, one that reads PROCEED) makes a vision-language model change its decision, on InternVL2.5 with CHAI's DriveLM scenes. So far the attack reproduces, but more weakly than the paper reports, and a linear probe on the model's hidden states can already tell when it is following the sign instead of the scene. We've also compared model sizes from 1B to 8B, and next we want to try activation steering as a defense.",
      },
    ],
  },
  {
    slug: "spyder",
    group: "research",
    title: "SPYDER: One Photo, Hours of Footage",
    kicker: "research · Samsung Innovation Campus AI capstone",
    year: "2026",
    summary:
      "Find a person in low-resolution surveillance video from a single photo, and say \"no match\" honestly instead of always guessing.",
    stats: [
      ["7.5x", "faster than real time when indexing video"],
      ["18 ms", "face detection per frame on an M2"],
      ["3", "embedding models compared under identical conditions"],
    ],
    facts: [
      ["role", "built the system end to end"],
      ["team", "with Aman Dhaubanjar and Ayush Kumar Jha"],
      ["timeline", "Oct 2026 - present"],
      ["stack", "SCRFD, ArcFace / SFace / AdaFace (ONNX + CoreML), FAISS, FastAPI, WebSockets, React"],
    ],
    links: [
      { label: "write-up on medium", href: "https://medium.com/@pokhrelankit/one-shot-person-identification-from-low-resolution-surveillance-video-7aa439bb5fc3", kind: "medium" },
    ],
    hero: {
      img: "command.webp",
      alt: "SPYDER command screen with camera tiles, a watchlist, an unverified alert and an activity feed",
      caption:
        "The command screen from the UI prototype. Silhouettes stand in for faces: volunteer footage never leaves the collecting laptop.",
    },
    body: [
      { h: "The problem" },
      {
        p: "On clean photos face recognition is close to solved: NIST reports error rates around 0.15% for the best systems. Surveillance footage isn't clean. Faces are small, blurred, compressed, dark and turned away, and the same models fall hard there (one drops from 65.2% to 29.9% rank-1 on real CCTV). A system that always returns its closest guess will hand an investigator the wrong person.",
      },
      { h: "What I built" },
      {
        p: "A complete pipeline: video in, faces detected (SCRFD), tracked, filtered by a quality gate, aligned and embedded, then matched.",
      },
      {
        list: [
          "<b>Live Watch:</b> armed subjects are matched in real time and raise one alert per appearance, with evidence.",
          "<b>Recorded Search:</b> each video gets a cached FAISS index, and one photo returns ranked candidate tracks or \"no match\".",
          "<b>Three embedding models behind one interface</b> (ArcFace R50, SFace, AdaFace IR-101), so they can be compared under identical conditions.",
          "<b>A calibrated threshold</b> set from strangers' scores at a target false-alarm rate, so \"no match\" is a real answer.",
          "31 REST endpoints plus a WebSocket event channel, 63 automated backend tests, and CI.",
        ],
      },
      { h: "Built to produce leads, not verdicts" },
      {
        p: "Every candidate is marked <b>unverified</b> and needs a human to hold-to-confirm or reject. No raw live video is stored, only alert evidence (the best face and one frame), and expired data is garbage-collected. Volunteers gave written consent, and their data stays on the collecting machine.",
      },
      {
        fig: "boot.webp",
        alt: "SPYDER sign-in screen with system status checks",
        caption: "Sign-in: every action is written to an activity log under the operator's ID.",
      },
      { h: "Fast enough for a laptop" },
      {
        p: "On a MacBook Air M2 with CoreML, face detection takes about 18 ms per frame and each embedding 3-5 ms. Indexing recorded video at 5 sampled frames per second runs about <b>7.5x faster than real time</b>, so an hour of footage takes roughly 8 minutes, and searching a video's faces takes about 0.04 ms per query.",
      },
      { h: "Status" },
      {
        p: "All software milestones are built and tested. What's left is the evaluation itself: recording the consented volunteer gallery and running the degradation, calibration and subgroup experiments.",
      },
    ],
  },

  /* ------------------------------------------------ builds */
  {
    slug: "english-nepali-translation",
    group: "builds",
    title: "English to Nepali Translation, From Scratch",
    kicker: "deep learning · nlp",
    year: "2026",
    summary:
      "A 35M-parameter Transformer I wrote from the paper up and trained on a laptop, translating everyday English into fluent Nepali.",
    stats: [
      ["13.8", "BLEU on FLORES-200"],
      ["41.2", "ChrF, the fairer score for Nepali"],
      ["12x", "faster epochs after fixing the data pipeline"],
    ],
    facts: [
      ["role", "solo"],
      ["timeline", "2025 - 2026"],
      ["data", "NLLB English-Nepali, filtered to the best 1M pairs"],
      ["stack", "PyTorch, SentencePiece, Gradio, Hugging Face Spaces"],
    ],
    links: [
      { label: "live demo", href: "https://huggingface.co/spaces/ankitpokhrel/english-to-nepali", kind: "live" },
      { label: "source", href: "https://github.com/ankitpokhrel08/transformer_implementation", kind: "src" },
    ],
    hero: {
      img: "demo.webp",
      light: true,
      alt: "The translator on Hugging Face Spaces translating an English sentence into Nepali",
      caption:
        "My sentence, its real output. The demo sleeps when idle, so give it about a minute to wake.",
    },
    body: [
      { h: "Why build it from scratch" },
      {
        p: "I wanted to understand Transformers by building one with no translation library doing the hard parts: multi-head self and cross attention, sinusoidal positional encodings, the warmup learning-rate schedule, label smoothing. All of it is written by hand in PyTorch.",
      },
      { h: "It started as Sanskrit" },
      {
        p: "The first version translated Sanskrit to English, character by character. Ten epochs took about 18 hours on my M2 Air and produced phonetic mush. Around 80% of the attention compute was being spent on padding.",
      },
      {
        p: "Switching to BPE tokens and length-bucketed batches made epochs <b>about 12x faster</b> and the English fluent, but the scores stayed in single digits. The model wasn't the problem. The corpus was 73k pairs of epic verse with loose, literary translations. In low-resource translation the data is the model, so I moved to a language pair with about 20 times more data and a standard benchmark.",
      },
      { h: "What I built" },
      {
        list: [
          "An encoder-decoder Transformer: 4 + 4 layers, d_model 384, 8 heads, <b>35.0M parameters</b>.",
          "SentencePiece BPE with 16k pieces per language and byte fallback, so no word is ever unknown.",
          "Data: NLLB's 19.6M mined English-Nepali pairs, cleaned and cut to the top 1M by LASER score.",
          "Training: 6 epochs on an Apple M2 Air, about 2 hours each. Dev loss fell from 9.69 to about 4.55 with no overfitting.",
          "Shipped as a Gradio app on Hugging Face Spaces.",
        ],
      },
      { h: "Results" },
      {
        p: "On FLORES-200 devtest (1,012 unseen sentences, greedy decoding): <b>BLEU 13.78, ChrF 41.22</b>. ChrF is the fairer judge here, because Nepali's rich inflection makes BLEU's exact-word matching read low. Its best translations are near-human:",
      },
      {
        code: "EN  : In remote locations, without cell phone coverage, a satellite phone may be your only option.\nREF : दुर्गम स्थानहरूमा, सेल फोनको कभरेज बिना, उपग्रह फोन तपाईंको एक मात्र विकल्प हुन सक्छ।\nHYP : रिमोट स्थानहरूमा, सेल फोन कभरेज बिना, एक उपग्रह फोन तपाईंको मात्र विकल्प हुन सक्छ।\n      BLEU 55.7 · ChrF 77.9",
      },
      {
        fig: "bleu-by-length.webp",
        light: true,
        alt: "Bar chart of sentence BLEU by source length bucket",
        caption: "Sentence BLEU by source length: steady for everyday sentences, weaker on very short and very long ones.",
      },
      {
        p: "It still drops rare compound terms and borrows English loanwords like रिमोट where a native word exists. Beam search and more epochs would close part of that gap.",
      },
    ],
  },
  {
    slug: "aakha",
    group: "builds",
    title: "Aakha: Walking Guidance for Blind Users",
    kicker: "hackathon · assistive computer vision",
    year: "2026",
    summary:
      "Turns a phone camera into short spoken cues for blind and low-vision walkers, with no LLM anywhere in the safety loop.",
    stats: [
      ["0", "LLMs in the safety loop"],
      ["1", "speech channel, ranked by urgency"],
      ["3", "voice commands: read, identify, repeat"],
    ],
    facts: [
      ["role", "built most of the system (team of 3)"],
      ["timeline", "Jul 2026, at a hackathon"],
      ["stack", "YOLO11n + ByteTrack (ONNX), Depth Anything V2, OpenCV, Vosk, FastAPI WebSockets, Android"],
    ],
    links: [
      { label: "demo video", href: "https://www.youtube.com/shorts/-_-2K9LM0G4", kind: "video" },
      { label: "source", href: "https://github.com/ankitpokhrel08/Aakha", kind: "src" },
    ],
    hero: {
      videos: [
        { src: "zebra-crossing.mp4", poster: "zebra-crossing-poster.webp" },
        { src: "car-ahead.mp4", poster: "car-ahead-poster.webp" },
      ],
      caption:
        "Real street footage through the pipeline. Cyan is the walking corridor, yellow marks zebra stripes, and the top-left text is the cue it speaks.",
    },
    body: [
      { h: "The problem" },
      {
        p: "A white cane finds what's at your feet. It doesn't tell you a scooter is closing in, or that a zebra crossing is right in front of you. And \"is it safe to step forward\" is the wrong question to hand to a large language model that can be slow or wrong. Aakha keeps the safety loop to classic computer vision and small, fast models.",
      },
      { h: "How it works" },
      {
        p: "The phone is the camera and the speaker. A laptop runs the pipeline, and the phone connects over a Cloudflare HTTPS tunnel by scanning a QR code.",
      },
      {
        list: [
          "<b>YOLO11n with ByteTrack</b> tracks objects every frame. Only things whose ground contact falls inside a walking corridor matter, so a bus across the road is ignored.",
          "<b>Collision cues</b> come from how fast a tracked box grows: a looming object becomes \"closing on person\".",
          "<b>Depth Anything V2</b> runs in the background for walls, and classic CV finds zebra crossings (edges and Hough lines) and traffic-light colours.",
          "<b>One voice.</b> Every part of the system posts to one priority queue, and exactly one consumer speaks, so cues never talk over each other. A soft beep means the path ahead is clear.",
          "<b>Hold to talk:</b> offline Vosk speech recognition handles \"read this\" (on-device OCR), \"what am I holding\" and \"repeat that\".",
        ],
      },
      { h: "Designed to be used without sight" },
      {
        p: "The whole phone screen is one button: tap to start or pause, hold to speak. There are no menus to find. Critical cues jump the queue but never cut off a sentence already playing, which can delay them a second or two, so every cue is kept short.",
      },
    ],
  },
  {
    slug: "voice-bridge",
    group: "builds",
    title: "Voice Bridge: Calls Without a Language Barrier",
    kicker: "real-time speech · webrtc",
    year: "2026",
    summary:
      "A video-calling app where each person speaks their own language and reads the other in theirs, as live captions.",
    stats: [
      ["2-way", "translated live captions"],
      ["16 kHz", "mic audio streamed by each caller"],
      ["0", "API keys needed by default"],
    ],
    facts: [
      ["role", "built the transcription, translation and current app, on a calling base started with a teammate"],
      ["timeline", "2025 - 2026"],
      ["stack", "WebRTC, Socket.io, React + TypeScript, FastAPI, faster-whisper, Argos Translate"],
    ],
    links: [
      { label: "live app", href: "https://voice-bridge-kan6.onrender.com", kind: "live" },
      { label: "source", href: "https://github.com/ankitpokhrel08/voice-bridge", kind: "src" },
    ],
    hero: {
      img: "login.webp",
      alt: "Voice Bridge sign-in screen: pick the language you speak and the language for captions",
      caption: "You pick the language you speak and the one you want to read.",
    },
    body: [
      { h: "The idea" },
      {
        p: "Two people who don't share a language should still be able to just call each other. In Voice Bridge the other person's words show up as captions in your language while they talk, and what you type in chat arrives in theirs.",
      },
      { h: "How it works" },
      {
        list: [
          "Peer-to-peer <b>WebRTC</b> video and audio (plus screen share), signalled over Socket.io.",
          "Each caller streams <b>their own mic</b> to a FastAPI backend over a WebSocket, as 16 kHz PCM from an AudioWorklet.",
          "The backend finds speech with voice-activity detection, transcribes it locally with <b>faster-whisper</b>, translates it into the other caller's language and pushes it back as a caption.",
          "Translation is <b>free and offline by default</b> with Argos Translate; Google Cloud Translation is an opt-in for higher quality.",
          "Translated text chat rides the same WebSocket, with typing helpers like phonetic transliteration for Hindi, Arabic and Japanese.",
        ],
      },
      {
        fig: "call.webp",
        alt: "In-call view with a video tile, translated captions and a chat panel",
        caption: "In-call view from a test call with fake camera devices: captions and translated chat on the right.",
      },
      { h: "Honest limits" },
      {
        p: "Two-party calls only, no auth, and state lives in memory, so a server restart drops the call. Captions arrive per phrase, after you pause, not word by word. Calls behind strict mobile NATs need TURN, so free relay servers are already wired in.",
      },
    ],
  },
  {
    slug: "kanun-sathi",
    group: "builds",
    title: "Kanun Sathi: Nepal's Law, With Sources",
    kicker: "hackathon · retrieval-augmented generation",
    year: "2026",
    summary:
      "Ask a legal question in Nepali or English and get an answer grounded in the actual law, with the source cited.",
    stats: [
      ["768-d", "embeddings, run locally with Ollama"],
      ["2", "languages: ask in Nepali or English"],
    ],
    facts: [
      ["role", "RAG pipeline, backend, frontend and Docker setup (team of 4)"],
      ["timeline", "started at my first hackathon; this version Jan - Feb 2026"],
      ["stack", "Morphik (open-source RAG), FastAPI, PostgreSQL + pgvector, Gemini 2.5 Flash, Redis + ARQ, React"],
    ],
    links: [{ label: "source", href: "https://github.com/ankitpokhrel08/Kanun_Sathi", kind: "src" }],
    hero: {
      img: "chat.webp",
      light: true,
      alt: "Kanun Sathi chat answering a Nepali question about dissolving parliament",
      caption: "Asked in Nepali about dissolving parliament, it answers from the Constitution and lists the source.",
    },
    body: [
      { h: "The problem" },
      {
        p: "Many young people in Nepal have no reliable way to check what the law actually says. They pick it up from social media or from elders answering from experience. Kanun Sathi answers in plain language from the Constitution, criminal law, family law and social regulations, and every answer names the document and article it came from, so people can check it themselves.",
      },
      { h: "What I built" },
      {
        list: [
          "Built on <b>Morphik</b>, an open-source RAG framework, configured for Nepali.",
          "<b>Gemini 2.5 Flash</b> writes the answers; we picked it because it handled Nepali better.",
          "Embeddings run locally with Ollama's <b>nomic-embed-text</b> (768 dimensions), stored in PostgreSQL with <b>pgvector</b>.",
          "Documents are chunked at 2,000 with 200 overlap; the original 6,000 kept overflowing the local model's context.",
          "Prompts that enforce citations, so every answer points back to <b>page-level sources</b> in the law.",
          "Ingestion runs in background workers (Redis + ARQ), so uploading a big document doesn't block the API.",
          "A React + TypeScript frontend, and the whole stack (FastAPI, PostgreSQL/pgvector, Redis, Ollama) containerised with Docker Compose.",
        ],
      },
      {
        fig: "research.webp",
        light: true,
        alt: "Lawyer research view with document selection and a question box",
        caption: "The research view: pick specific documents, then ask across just those.",
      },
    ],
  },
  {
    slug: "gym-guru",
    group: "builds",
    title: "Gym Guru: Five Minutes a Day, Better Form",
    kicker: "mobile app · flutter",
    year: "2026",
    summary:
      "A Flutter app that teaches one movement skill a day and coaches every rep through the camera.",
    stats: [
      ["12", "reps in each tracked set"],
      ["10", "onboarding steps, ending in a 30-day plan"],
      ["5 min", "a day"],
    ],
    facts: [
      ["role", "solo"],
      ["status", "UI-complete prototype; on-device pose estimation is next"],
      ["timeline", "Oct 2026"],
      ["stack", "Flutter, Dart, CustomPainter, GitHub Actions CI"],
    ],
    links: [],
    hero: {
      img: "cover.webp",
      alt: "Four Gym Guru phone screens: form check, live set, results and skill path",
      caption: "Form check, a live tracked set, results, and the skill path.",
    },
    body: [
      { h: "The idea" },
      {
        p: "Most people quit training because sessions are long and nobody tells them their form is off. Gym Guru turns training into a short daily lesson: <b>learn</b> one skill like squat depth from a demo and three cues, <b>practise</b> a tracked set of 12 reps in front of the phone camera, then <b>review</b> a form score with errors flagged on the exact rep they happened.",
      },
      { h: "Where it stands" },
      {
        p: "It's a UI-complete prototype. Navigation, state and the whole lesson loop work. The camera feed and pose data are simulated: the skeleton is drawn from a depth curve, and scripted mistakes on rep 4 (knees cave in) and rep 9 (too shallow) exercise the coaching and results screens end to end.",
      },
      {
        fig: "screens.webp",
        alt: "Five Gym Guru screens: goals, plan, today, progress and share",
        caption: "Onboarding goals, the personal plan, today, progress and share cards.",
      },
      { h: "Decisions" },
      {
        list: [
          "Each flow owns one ChangeNotifier, so there are no state-library dependencies while the data model settles.",
          "Fonts ship with the app and runtime font fetching is off, so it renders correctly with no network.",
          "Next: real pose estimation on device (ML Kit or MediaPipe), local persistence, then accounts.",
        ],
      },
    ],
  },
];

/* Smaller projects: one row each, linking straight out. img is optional (assets/projects/more/). */
const MORE_PROJECTS = [
  {
    name: "ragchatbot",
    desc: "Open-source RAG SDK (v1.1.3 on PyPI): point it at a folder of docs and get a semantic-search chatbot API, no ML setup. Gemini, OpenAI or local Ollama behind one interface, ChromaDB with MD5-based incremental indexing, token streaming, 25 tests.",
    tile: "pip install ragchatbot",
    links: [
      { label: "pypi", href: "https://pypi.org/project/ragchatbot/", kind: "pypi" },
      { label: "source", href: "https://github.com/ankitpokhrel08/ragchatbot", kind: "src" },
    ],
  },
  {
    name: "Celebrity Look-alike",
    desc: "Face retrieval over 235 cricketers, footballers and actors with YuNet + SFace embeddings: 94.1% top-1 in leave-one-out tests. I ran my own photo through it: Darsheel Safary, 45.8%.",
    img: "celebrity.webp",
    links: [
      { label: "live", href: "https://yourcelebritylookalike.streamlit.app/", kind: "live" },
      { label: "source", href: "https://github.com/ankitpokhrel08/celebrity-lookalike", kind: "src" },
    ],
  },
  {
    name: "Nagarik Suchana",
    desc: "Bilingual civic app (team project) connecting citizens with their municipality for notices and grievances. OCR (Tesseract.js) + Gemini extracts 30+ structured fields from notice images and PDFs to match notices to the right citizens.",
    img: "nagarik.webp",
    links: [{ label: "source", href: "https://github.com/ankitpokhrel08/nagarik-suchana", kind: "src" }],
  },
  {
    name: "PM Study",
    desc: "Built for my own exam prep: chapter notes, mind maps, flashcards and past questions for ICT Project Management (CT701).",
    img: "pm-study.webp",
    links: [
      { label: "live", href: "https://ankitpokhrel08.github.io/pm-study/", kind: "live" },
      { label: "source", href: "https://github.com/ankitpokhrel08/pm-study", kind: "src" },
    ],
  },
  {
    name: "MCP Multi-Server Chat",
    desc: "A chatbot wired to several Model Context Protocol servers: math tools, a remote expense tracker and Manim animation generation, through a LangChain MCP client.",
    img: "mcp.webp",
    links: [{ label: "source", href: "https://github.com/ankitpokhrel08/MCP-Servers", kind: "src" }],
  },
  {
    name: "Infant Cry Classification",
    desc: "Classifies infant cries (hunger, pain, discomfort) with a TensorFlow LSTM on MFCC and spectral features from 1,000+ recordings, SMOTE for class imbalance, and TensorFlow Lite for on-device inference in a React Native app.",
    tile: "mfcc → lstm → tflite",
    links: [{ label: "source", href: "https://github.com/ankitpokhrel08/infant_cry_classification", kind: "src" }],
  },
];

/* Older experiments: plain text list. */
const ARCHIVE = [
  ["Network Anomaly Detection", "Isolation Forest written from scratch", "python · streamlit", [["live", "https://networkanomalywithif.streamlit.app/"]]],
  ["Next Nepali Word Prediction", "GRU language model on Nepali text", "tensorflow · gru", [["live", "https://nepaliwordpredicton.streamlit.app/"], ["src", "https://github.com/ankitpokhrel08/next_nepali_word_prediction"]]],
  ["Movie Review Sentiment", "RNN that reads a review and gives it stars", "tensorflow · rnn", [["live", "https://movie-review-ankit.streamlit.app/"], ["src", "https://github.com/ankitpokhrel08/IMDB_RNN"]]],
  ["Stock Price Prediction", "LSTM forecasting on historical prices", "keras · streamlit", [["live", "https://ankitstockpriceprediction.streamlit.app/"], ["src", "https://github.com/ankitpokhrel08/stock-price-prediction"]]],
  ["PDF Chatbot", "my first RAG: ask questions about a PDF", "langchain · gemini", [["src", "https://github.com/ankitpokhrel08/pdf_chatbot"]]],
  ["LLM Projects", "fine-tuning and LLM experiments from the learning phase", "qlora · hugging face", [["post", "https://medium.com/@pokhrelankit/fine-tuning-llama2-7b-on-personal-dataset-code-explanation-provided-4bcbfe956b3e"], ["src", "https://github.com/ankitpokhrel08/llm-projects"]]],
  ["Sorting Visualizer", "watch sorting algorithms run, step by step", "react · vite", [["live", "https://sortingalgorithmvisualize.netlify.app/"], ["src", "https://github.com/ankitpokhrel08/sorting-visualize"]]],
  ["Nepali Radios", "live Nepali FM stations in one place", "react · flask", [["src", "https://github.com/ankitpokhrel08/nepali-radios"]]],
  ["RegEx2DFA", "regular expression to DFA, drawn with Graphviz", "c++ · automata", [["src", "https://github.com/ankitpokhrel08/RegEx2DFA"]]],
  ["Money Map", "virtual money transfers with a transaction log", "mern", [["video", "https://youtu.be/n6poEoOW1_E"], ["src", "https://github.com/ankitpokhrel08/money_map"]]],
  ["Cloud Decode", "GitHub Actions deploying to an S3 static site", "aws · ci/cd", [["src", "https://github.com/ankitpokhrel08/cloud_decode"]]],
  ["Numerical Methods", "root finding, interpolation, ODE solvers", "c · python", [["src", "https://github.com/ankitpokhrel08/numerical_methods"]]],
  ["OpenUI Library", "open-source contribution: circular progress bar component, merged", "open source", [["live", "https://www.openuilibrary.com/"]]],
];

/* Which case studies appear on the home page, in order. */
const HOME_FEATURED = ["ndn-anomaly-detection", "midas", "spyder", "english-nepali-translation", "aakha", "padel"];

/* Writing on Medium (home page "writing" section). img lives in assets/writing/; file = name in the terminal's writing/ folder. Newest first. */
const WRITING = [
  {
    title: "One-Shot Person Identification from Low-Resolution Surveillance Video",
    file: "one-shot-person-identification",
    date: "Nov 2026",
    desc: "The problem and design behind SPYDER: finding one person across hours of low-resolution camera footage from a single photo.",
    img: "spyder.webp",
    href: "https://medium.com/@pokhrelankit/one-shot-person-identification-from-low-resolution-surveillance-video-7aa439bb5fc3",
  },
  {
    title: "Fine-tuning Llama 2 7B on a Personal Dataset",
    file: "fine-tuning-llama-2-7b",
    date: "Jan 2026",
    desc: "Parameter-efficient fine-tuning with LoRA and QLoRA, walked through line by line on my own dataset.",
    img: "llama2-finetuning.webp",
    href: "https://medium.com/@pokhrelankit/fine-tuning-llama2-7b-on-personal-dataset-code-explanation-provided-4bcbfe956b3e",
  },
  {
    title: "Optimizers in Deep Learning",
    file: "optimizers-in-deep-learning",
    date: "Jul 2025",
    desc: "From SGD with momentum to Adam: how optimizers help a network train faster and converge.",
    img: "optimizers.webp",
    href: "https://medium.com/@pokhrelankit/optimizers-in-deep-learning-df988f1c8f21",
  },
  {
    title: "How I Used ML to Find Hidden Bonds Between Countries Through Their Anthems",
    file: "national-anthems-and-ml",
    date: "Jun 2025",
    desc: "TF-IDF, PCA and K-Means on national anthem lyrics, grouping countries by their words instead of their borders.",
    img: "anthems.webp",
    href: "https://medium.com/@pokhrelankit/how-i-used-ml-to-find-hidden-bonds-between-countries-through-their-anthems-b8b35122124a",
  },
];
