/* =====================================================
   Gallery content. This is the only file to edit when
   adding photos or changing stories.

   After editing, run:   node tools/build-gallery.mjs
   It converts new .jpg/.png photos in assets/gallery/web/
   to WebP (needs: brew install webp imagemagick) and writes the
   figures straight into gallery.html, so the page works
   without JS and search engines can read the stories.

   Each entry:
     imgs:  image names inside assets/gallery/web/, no extension
            (2+ images = auto slider with dots)
     tag:   small label, e.g. "hackathon · 2025"
     title: bold title shown on hover
     story: your thoughts, shown under the title
===================================================== */
const GALLERY = [
  {
    imgs: ["locus_lost"],
    tag: "locus 2027 · ai lead",
    title: "AI Lead, LOST",
    story:
      "Leading the AI sub-team of the LOCUS Open Source Team for LOCUS 2027, the 23rd National Technological Festival. Frontend, backend and AI building together; I started at LOCUS as a first-year fellow.",
  },
  {
    imgs: [
      "softwarefellowship1",
      "softwarefellowship2",
      "softwarefellowship3",
    ],
    tag: "locus · fellowship",
    title: "Software Fellowship",
    story:
      "Joined LOCUS Software Fellowship as a first-year fellow. Now I'm back as an instructor, teaching fellows Python, GitHub, and machine learning. Same event, other side of the desk.",
  },
  {
    imgs: ["cybersecurity_event"],
    tag: "it club · workshop",
    title: "Cybersecurity & Linux Workshop",
    story:
      "Three days of networking, learning, and handling chaos, organised by our IT Club team. Bunked a few classes to keep the timeline alive. Absolutely worth it.",
  },
  {
    imgs: ["cit_0", "cit_1", "cit_2"],
    tag: "volunteering",
    title: "CIT: Children in Technology",
    story:
      "LOCUS and WorldLink teaming up to teach government school students about technology, cybersecurity, the internet, and ML. I went as a tutor; the kids' perspective taught me right back. The most feel-good thing I've done.",
  },
  {
    imgs: ["suii"],
    tag: "hackathon · blockchain",
    title: "Suiii",
    story:
      "Blockchain hackathon with iBriz.ai and IT Club. Got hands-on with the SUI coin and how chains actually work, so yes, the title is fully intended.",
  },
  {
    imgs: ["hackathon", "hackathon1"],
    tag: "first hackathon",
    title: "Where it started",
    story:
      "My first ever hackathon. We built Kanun Sathi, a RAG-based legal assistant fed with Nepali government documents: ask in plain words, get grounded answers. The project outlived the event.",
  },
  {
    imgs: ["telemedicine"],
    tag: "hackathon · runner-up",
    title: "Telemedicine Hackathon",
    story:
      "The eye-opener. Health professionals showed us what healthcare in Nepal really struggles with, and we built a digital drug registration system to replace a still-paper-based process. Sounds simple, wasn't. Finished 1st runner-up.",
  },
  {
    imgs: ["seedsforfuture"],
    tag: "fellowship · huawei",
    title: "Seeds for the Future",
    story:
      "Selected among Nepal's top 30 students for Huawei's CSR program. 5G, AI, and cloud computing in the sessions; NCELL's data center and UNESCO's Nepal office in between, discussing how tech can preserve languages and cultural heritage.",
  },
  {
    imgs: ["sailung"],
    tag: "trek",
    title: "Sailung",
    story: "Just me.",
  },
  {
    imgs: ["hacktoberfest"],
    tag: "open source",
    title: "Hacktoberfest",
    story:
      "Made the global top 10,000 contributors and earned the t-shirt. Fully worth the merge conflicts.",
  },
  {
    imgs: ["github_event"],
    tag: "it club × pdsc",
    title: "GitHub workshop",
    story:
      "IT Club and PDSC collab, supported by GitHub: teaching students the commands they'll use daily and the ones they'll keep googling forever.",
  },
  {
    imgs: ["devfest"],
    tag: "first meetup",
    title: "DevFest",
    story:
      "My very first tech meetup. Open source, RAG, AI in banking, and the realisation that the local tech scene is much bigger than I thought.",
  },
  {
    imgs: ["leapfrog"],
    tag: "challenge · 2x winner",
    title: "60 Days of Learning",
    story:
      "Learn something, post about it, every day for 60 days, no broken streaks. Won it twice in two years. Consistency is a skill; the prize is a bonus.",
  },
  {
    imgs: ["samsung_innovation"],
    tag: "certification",
    title: "Samsung Innovation College",
    story:
      "Samsung's CSR program teaching Nepali students Python, run in collaboration with Pulchowk Campus. Got to learn the Samsung syllabus first-hand. Certified, and genuinely fun.",
  },
  {
    imgs: ["minor"],
    tag: "university",
    title: "Minor project days",
    story:
      "The minor project group behind the NDN anomaly detection research. Started as a syllabus requirement, became the research on my projects page.",
  },
  {
    imgs: ["npl_allday"],
    tag: "cricket",
    title: "NPL all day",
    story:
      "Nepal Premier League at the stadium. The noise when Bhurtel hits a six is unreal.",
  },
  {
    imgs: ["loveforthegame"],
    tag: "sport",
    title: "Love for the game",
    story: "Some things you don't outgrow. The game is the game.",
  },
  {
    imgs: ["farewell"],
    tag: "campus",
    title: "Farewell",
    story: "Life outside the terminal. It compiles too.",
  },
  {
    imgs: ["happiness"],
    tag: "candid",
    title: "Happiness",
    story: "No context needed. Just a good day.",
  },
  {
    imgs: ["shah_rukh"],
    tag: "icon",
    title: "SRK",
    story: "Hitting this pose is mandatory",
  },
];
