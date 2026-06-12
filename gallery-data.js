/* =====================================================
   Gallery content. This is the only file to edit when
   adding photos or changing stories.

   Each entry:
     imgs:  file names inside assets/gallery/web/
            (2+ images = auto slider with dots)
     tag:   small label, e.g. "hackathon · 2025"
     title: bold title shown on hover
     story: your thoughts, shown under the title
===================================================== */
const GALLERY = [
  {
    imgs: [
      "softwarefellowship1.jpg",
      "softwarefellowship2.jpg",
      "softwarefellowship3.jpg",
    ],
    tag: "locus · fellowship",
    title: "Software Fellowship",
    story:
      "Joined LOCUS Software Fellowship as a first-year fellow. Now I'm back as an instructor, teaching fellows Python, GitHub, and machine learning. Same event, other side of the desk.",
  },
  {
    imgs: ["cybersecurity_event.jpg"],
    tag: "it club · workshop",
    title: "Cybersecurity & Linux Workshop",
    story:
      "Three days of networking, learning, and handling chaos, organised by our IT Club team. Bunked a few classes to keep the timeline alive. Absolutely worth it.",
  },
  {
    imgs: ["cit_0.jpg", "cit_1.jpg", "cit_2.jpg"],
    tag: "volunteering",
    title: "CIT: Children in Technology",
    story:
      "LOCUS and WorldLink teaming up to teach government school students about technology, cybersecurity, the internet, and ML. I went as a tutor; the kids' perspective taught me right back. The most feel-good thing I've done.",
  },
  {
    imgs: ["suii.jpg"],
    tag: "hackathon · blockchain",
    title: "Suiii",
    story:
      "Blockchain hackathon with iBriz.ai and IT Club. Got hands-on with the SUI coin and how chains actually work, so yes, the title is fully intended.",
  },
  {
    imgs: ["hackathon.jpg", "hackathon1.jpg"],
    tag: "first hackathon",
    title: "Where it started",
    story:
      "My first ever hackathon. We built Kanun Sathi, a RAG-based legal assistant fed with Nepali government documents: ask in plain words, get grounded answers. The project outlived the event.",
  },
  {
    imgs: ["telemedicine.jpg"],
    tag: "hackathon · runner-up",
    title: "Telemedicine Hackathon",
    story:
      "The eye-opener. Health professionals showed us what healthcare in Nepal really struggles with, and we built a digital drug registration system to replace a still-paper-based process. Sounds simple, wasn't. Finished 1st runner-up.",
  },
  {
    imgs: ["seedsforfuture.jpg"],
    tag: "fellowship · huawei",
    title: "Seeds for the Future",
    story:
      "Selected among Nepal's top 30 students for Huawei's CSR program. 5G, AI, and cloud computing in the sessions; NCELL's data center and UNESCO's Nepal office in between, discussing how tech can preserve languages and cultural heritage.",
  },
  {
    imgs: ["sailung.jpg"],
    tag: "trek",
    title: "Sailung",
    story: "Just me.",
  },
  {
    imgs: ["hacktoberfest.jpg"],
    tag: "open source",
    title: "Hacktoberfest",
    story:
      "Made the global top 10,000 contributors and earned the t-shirt. Fully worth the merge conflicts.",
  },
  {
    imgs: ["github_event.jpg"],
    tag: "it club × pdsc",
    title: "GitHub workshop",
    story:
      "IT Club and PDSC collab, supported by GitHub: teaching students the commands they'll use daily and the ones they'll keep googling forever.",
  },
  {
    imgs: ["devfest.jpg"],
    tag: "first meetup",
    title: "DevFest",
    story:
      "My very first tech meetup. Open source, RAG, AI in banking, and the realisation that the local tech scene is much bigger than I thought.",
  },
  {
    imgs: ["leapfrog.jpg"],
    tag: "challenge · 2x winner",
    title: "60 Days of Learning",
    story:
      "Learn something, post about it, every day for 60 days, no broken streaks. Won it twice in two years. Consistency is a skill; the prize is a bonus.",
  },
  {
    imgs: ["samsung_innovation.jpg"],
    tag: "certification",
    title: "Samsung Innovation College",
    story:
      "Samsung's CSR program teaching Nepali students Python, run in collaboration with Pulchowk Campus. Got to learn the Samsung syllabus first-hand. Certified, and genuinely fun.",
  },
  {
    imgs: ["minor.jpg"],
    tag: "university",
    title: "Minor project days",
    story:
      "The minor project group behind the NDN anomaly detection research. Started as a syllabus requirement, became the research on my projects page.",
  },
  {
    imgs: ["npl_allday.jpg"],
    tag: "cricket",
    title: "NPL all day",
    story:
      "Nepal Premier League at the stadium. The noise when Bhurtel hits a six is unreal.",
  },
  {
    imgs: ["loveforthegame.jpg"],
    tag: "sport",
    title: "Love for the game",
    story: "Some things you don't outgrow. The game is the game.",
  },
  {
    imgs: ["farewell.jpg"],
    tag: "campus",
    title: "Farewell",
    story: "Life outside the terminal. It compiles too.",
  },
  {
    imgs: ["happiness.jpg"],
    tag: "candid",
    title: "Happiness",
    story: "No context needed. Just a good day.",
  },
  {
    imgs: ["shah_rukh.jpg"],
    tag: "icon",
    title: "SRK",
    story: "Hitting this pose is mandatory",
  },
];
