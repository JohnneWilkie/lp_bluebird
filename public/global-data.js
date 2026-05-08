window.BlueBirdSite = (() => {
  const PHONE_RAW = "17817252193";
  const PHONE_PRETTY = "(781) 725-2193";
  const EMAIL = "info@bluebirdfence.com";
  const ADDRESS = "374 Cambridge St B, Burlington, MA 01803";

  const nav = [
    { label: "Home", href: "/" },
    { label: "Vinyl Fence", href: "/vinyl-fence" },
    { label: "Wood Fence", href: "/wood-fence" },
    { label: "Chain Link", href: "/chain-link-fence" },
    { label: "Aluminum Fence", href: "/aluminum-fence" },
    { label: "Gallery", href: "/gallery" },
    { label: "About", href: "/about" }
  ];

  const pageAssets = {
    about: {
      heroDesktop: "/assets/pages/about/hero-desktop.png",
      heroMobile: "/assets/pages/about/hero-mobile.png",
      callout: "/assets/pages/about/callout.png"
    },
    gallery: {
      heroDesktop: "/assets/pages/gallery/hero-desktop.jpg",
      heroMobile: "/assets/pages/gallery/hero-mobile.jpg",
      callout: "/assets/pages/gallery/callout.jpg"
    }
  };

  const sharedFaq = [
    {
      q: "How fast can I get a quote?",
      a: "Start online in a few clicks and our team follows up quickly with your next pricing step."
    },
    {
      q: "Do I need exact fence measurements?",
      a: "No. Your city, service area, and basic project details are enough to start."
    },
    {
      q: "Do you offer financing?",
      a: "Yes. Ask about financing options and we can help you find a payment path that fits your project."
    },
    {
      q: "Do you handle residential and commercial projects?",
      a: "Yes. BlueBird Fence supports both homeowners and commercial properties."
    }
  ];

  const sharedReviews = [
    {
      initial: "T",
      tone: "orange",
      name: "Tao Zhang",
      meta: "3 reviews • 2 photos",
      age: "3 weeks ago",
      tag: "",
      text: "BlueBird Fence did an outstanding job replacing our fence gate after it was destroyed by the winter winds. They came out for the onsite measurement and provided a quote the same day, which made everything incredibly convenient. The team handled the work professionally and installed a brand-new gate that looks even nicer than the original. The build quality is solid, and the whole experience was smooth from start to finish. Really appreciate their reliability and craftsmanship. Highly recommend them for any fence work.",
      services: "General repairs & maintenance",
      photos: ["/assets/reviews/tao-zhang-gate-1.jpg", "/assets/reviews/tao-zhang-gate-2.jpg"]
    },
    {
      initial: "B",
      tone: "photo",
      name: "Barry Forde",
      meta: "10 reviews • 2 photos",
      age: "2 weeks ago",
      tag: "Reasonable price",
      text: "The recently installed fence has significantly enhanced our property's aesthetics and security. The team demonstrated exceptional professionalism and skill throughout the entire process. Their meticulous attention to detail was evident in every aspect of the installation. We are thoroughly impressed with the quality of workmanship and the efficient completion of the project. This new fence is a testament to their outstanding job.",
      services: "Chain link fence installation",
      photos: []
    },
    {
      initial: "M",
      tone: "blue",
      name: "Muriel Fudala",
      meta: "Local Guide • 19 reviews • 1 photo",
      age: "2 weeks ago",
      tag: "Reasonable price",
      text: "Bluebird Fence did a beautiful job of replacing sections of my big wooden fence that had been destroyed by a falling tree limb. The new sections are all pressure treated wood, the posts are cemented into the ground, and everything matches the existing fence. It looks great. And communications and timing were good.",
      services: "Custom fabrication",
      photos: []
    },
    {
      initial: "J",
      tone: "photo",
      name: "Jennifer Cazenave",
      meta: "2 reviews • 1 photo",
      age: "2 weeks ago",
      tag: "Great price",
      text: "I highly recommend BlueBird Fence! They are very professional: they quickly set up an appointment to see the work we needed to have done and to provide an estimate. After we signed the agreement, they completed the work in a timely fashion. The fence repairs, along with the installation of two gates, all look great. We are very pleased and highly recommend them.",
      services: "Dog fence installation, Privacy fence installation, Wood fence installation",
      photos: ["/assets/reviews/jennifer-cazenave-gate.jpg"]
    },
    {
      initial: "J",
      tone: "green",
      name: "John Ballantine Jr.",
      meta: "2 reviews • 2 photos",
      age: "2 weeks ago",
      tag: "Reasonable price",
      text: "Terrific oak gate installed that ties into split rail fence. Efficient prompt service and great price. Support of crafts people",
      services: "Wood fence installation",
      photos: []
    },
    {
      initial: "W",
      tone: "red",
      name: "Will Mustoe",
      meta: "2 reviews • 0 photos",
      age: "5 days ago",
      tag: "",
      text: "Extremely happy with my new fence. The communication was great from the beginning. The crew showed up as scheduled and did a great job ! Super friendly and polite. They did a great job with the clean up after the job was completed. I would absolutely recommend bluebird fence to anyone looking for one",
      services: "",
      photos: []
    }
  ];

  const materialPages = {
    "wood-fence": {
      key: "wood-fence",
      title: "Wood Fence Installation in Boston Metro & Southern NH",
      h1: "Wood Fence Installation",
      heroText: "Classic, natural, and customizable wood fencing designed for privacy, curb appeal, and long-term property value.",
      image: "/assets/pages/wood-fence/hero-desktop.jpg",
      heroDesktop: "/assets/pages/wood-fence/hero-desktop.jpg",
      heroMobile: "/assets/pages/wood-fence/hero-mobile.jpg",
      callout: "/assets/pages/wood-fence/callout.png",
      galleryFolder: "wood-gallery",
      preset: { projectType: "New Fence", fenceStyle: "Wood Fence" },
      highlights: [
        "Privacy fences, picket, split-rail, and custom wood layouts",
        "Designed for New England weather and long-term performance",
        "Great fit for privacy, curb appeal, and boundary definition"
      ],
      gallery: [
        "/assets/pages/wood-fence/callout.png"
      ],
      sections: [
        {
          title: "Wood Fence Installation for Your Boston Metro Home",
          body: "BlueBird Fence provides premium wood fence installation throughout the greater Boston Metro area and Southern New Hampshire. We build durable, high-appearance fences tailored to your property goals, whether that means privacy, boundary definition, or a full backyard upgrade."
        },
        {
          title: "Popular Wood Fence Options",
          bullets: ["Privacy fences", "Picket fences", "Split-rail fences", "Post-and-rail fences", "Shadowbox fences", "Custom wood designs"]
        },
        {
          title: "Why Property Owners Choose Wood",
          bullets: ["Enhanced privacy and security", "Defined property boundaries", "Protection for children and pets", "Noise and wind reduction", "Improved property value", "Timeless natural appearance"]
        },
        {
          title: "Why Choose BlueBird Fence for Wood Projects",
          body: "Our team helps you choose the right wood type, style, and layout for your property goals and budget. From permit support to professional installation, we keep the process clean, clear, and efficient so you can move from estimate to installation with confidence."
        }
      ]
    },
    "vinyl-fence": {
      key: "vinyl-fence",
      title: "Vinyl Fence Installation in Boston Metro & Southern NH",
      h1: "Vinyl Fence Installation",
      heroText: "Low-maintenance vinyl fencing with strong curb appeal, clean lines, and long-lasting performance for homes and businesses.",
      image: "/assets/pages/vinyl-fence/hero-desktop.jpg",
      heroDesktop: "/assets/pages/vinyl-fence/hero-desktop.jpg",
      heroMobile: "/assets/pages/vinyl-fence/hero-mobile.jpg",
      callout: "/assets/pages/vinyl-fence/callout.png",
      galleryFolder: "vinyl-gallery",
      preset: { projectType: "New Fence", fenceStyle: "Vinyl Fence" },
      highlights: [
        "Clean, modern look with strong privacy options",
        "Low maintenance and weather-resistant performance",
        "Excellent long-term value for residential and commercial use"
      ],
      gallery: [
        "/assets/pages/vinyl-fence/callout.png"
      ],
      sections: [
        {
          title: "Vinyl Fence Installation with Durability and Style",
          body: "BlueBird Fence installs vinyl fencing solutions built for long-term value in New England conditions. Our team helps you choose the right style for privacy, perimeter definition, and visual impact while keeping upkeep minimal."
        },
        {
          title: "Vinyl Fence Services",
          bullets: ["Residential vinyl fencing", "Commercial vinyl installations", "Privacy vinyl fences", "Decorative vinyl styles", "Pool-safe vinyl enclosures", "Custom vinyl layouts"]
        },
        {
          title: "Why Choose Vinyl Fencing",
          bullets: ["Low maintenance and easy cleaning", "Strong weather resistance", "Consistent color and finish", "Excellent privacy options", "Long-term cost efficiency", "Clean, modern look"]
        },
        {
          title: "BlueBird Vinyl Installation Advantage",
          body: "We install premium vinyl systems that hold color, resist warping, and keep your exterior looking sharp. Our process is built to minimize friction: fast quote flow, practical style guidance, and a clear next-step plan."
        }
      ]
    },
    "chain-link-fence": {
      key: "chain-link-fence",
      title: "Chain Link Fence Installation in Boston Metro & Southern NH",
      h1: "Chain Link Fence Installation",
      heroText: "Practical and cost-effective chain link fencing for residential, commercial, and security-focused properties.",
      image: "/assets/pages/chain-link-fence/hero-desktop.jpg",
      heroDesktop: "/assets/pages/chain-link-fence/hero-desktop.jpg",
      heroMobile: "/assets/pages/chain-link-fence/hero-mobile.jpg",
      callout: "/assets/pages/chain-link-fence/callout.png",
      galleryFolder: "chain-link-gallery",
      preset: { projectType: "New Fence", fenceStyle: "Chain Link Fence" },
      highlights: [
        "Cost-effective perimeter and security solution",
        "Residential, commercial, and temporary applications",
        "Strong durability with quick installation turnaround"
      ],
      gallery: [
        "/assets/pages/chain-link-fence/callout.png"
      ],
      sections: [
        {
          title: "Professional Chain Link Fence Installation",
          body: "BlueBird Fence delivers chain link fence installation for properties that prioritize security, durability, and value. We install clean, reliable systems for homes, businesses, and active worksites."
        },
        {
          title: "Chain Link Use Cases",
          bullets: ["Residential chain link fencing", "Commercial chain link installations", "Security fencing", "Temporary construction fencing", "Pool enclosures", "Pet containment and sports court fencing"]
        },
        {
          title: "Why Chain Link Works",
          bullets: ["Budget-friendly installation", "Strong durability", "Fast installation timelines", "Low maintenance", "Excellent for perimeter control", "Flexible for many property types"]
        },
        {
          title: "Chain Link Planning Support",
          body: "From home boundaries to jobsite protection, we help you select the right gauge, height, and layout for your use case. You get a straightforward quote path and a solution focused on reliability."
        }
      ]
    },
    "aluminum-fence": {
      key: "aluminum-fence",
      title: "Aluminum Fence Installation in Boston Metro & Southern NH",
      h1: "Aluminum Fence Installation",
      heroText: "Premium aluminum fencing that balances clean design, strong perimeter protection, and low-maintenance ownership.",
      image: "/assets/pages/aluminum-fence/hero-desktop.jpg",
      heroDesktop: "/assets/pages/aluminum-fence/hero-desktop.jpg",
      heroMobile: "/assets/pages/aluminum-fence/hero-mobile.jpg",
      callout: "/assets/pages/aluminum-fence/callout.png",
      galleryFolder: "aluminum-gallery",
      preset: { projectType: "New Fence", fenceStyle: "Aluminum Fence" },
      highlights: [
        "Premium curb appeal with strong perimeter control",
        "Rust-resistant performance with low maintenance",
        "Ideal for front yards, pools, and decorative security"
      ],
      gallery: [
        "/assets/pages/aluminum-fence/callout.png"
      ],
      sections: [
        {
          title: "Aluminum Fence Installation for Lasting Value",
          body: "BlueBird Fence installs aluminum fencing solutions that deliver durability, polished appearance, and reliable performance for residential and commercial projects."
        },
        {
          title: "Aluminum Fence Services",
          bullets: ["Residential aluminum fencing", "Commercial aluminum fencing", "Pool enclosures", "Garden and landscape fencing", "Security perimeter fencing", "Decorative fence and gate integration"]
        },
        {
          title: "Why Property Owners Choose Aluminum",
          bullets: ["Rust- and corrosion-resistant", "Low maintenance", "Strong but lightweight", "Long-term investment value", "Wide style flexibility", "Boosts curb appeal and security"]
        },
        {
          title: "BlueBird Aluminum Installation Process",
          body: "We combine clean design recommendations with precise installation practices so your fence performs well and looks premium over time. Our team helps you align style, coverage, and budget before work begins."
        }
      ]
    },
    "temporary-fence": {
      key: "temporary-fence",
      title: "Temporary Fence Installation in Boston Metro & Southern NH",
      h1: "Temporary Fence Installation",
      heroText: "Short-term fencing for construction sites, events, and controlled access areas where security and flexibility matter.",
      image: "/assets/pages/temporary-fence/hero-desktop.jpg",
      heroDesktop: "/assets/pages/temporary-fence/hero-desktop.jpg",
      heroMobile: "/assets/pages/temporary-fence/hero-mobile.jpg",
      callout: "/assets/pages/temporary-fence/callout.png",
      galleryFolder: "temporary-gallery",
      preset: { projectType: "Temporary/Rental", fenceStyle: "Chain Link Fence" },
      highlights: [
        "Fast setup for sites, events, and short-term projects",
        "Flexible placement with reliable perimeter control",
        "Built for safety, compliance, and practical access control"
      ],
      gallery: [
        "/assets/pages/temporary-fence/callout.png"
      ],
      sections: [
        {
          title: "Temporary Fence Installation for Project Needs",
          body: "BlueBird Fence provides temporary fence installation for projects that require secure boundaries for a defined time window."
        },
        {
          title: "Temporary Fence Services",
          bullets: ["Construction site security", "Event perimeter fencing", "Crowd control barriers", "Emergency fencing", "Safety compliance support", "Temporary boundary control"]
        },
        {
          title: "Why Teams Use Temporary Fencing",
          bullets: ["Safer site operations", "Access control", "Protection of equipment and materials", "Regulatory compliance support", "Flexible deployment and removal", "Fast response for urgent needs"]
        },
        {
          title: "Temporary Fence Support from BlueBird",
          body: "Our team helps define the right temporary fencing footprint based on access points, safety needs, and schedule. You get a practical plan with fast follow-up and dependable service."
        }
      ]
    }
  };

  const galleryItems = [
    { src: "/assets/materials/vinyl/hero.jpg", category: "vinyl", alt: "Vinyl fence project" },
    { src: "/assets/materials/wood/hero.jpg", category: "wood", alt: "Wood fence project" },
    { src: "/assets/materials/chain-link/hero.jpg", category: "chain-link", alt: "Chain link fence project" },
    { src: "/assets/materials/aluminum/hero.jpg", category: "aluminum", alt: "Aluminum fence project" },
    { src: "/assets/materials/shared/commercial.jpg", category: "commercial", alt: "Commercial fence project" },
    { src: "/assets/materials/temporary/hero.jpg", category: "temporary", alt: "Temporary fence project" },
    { src: "/assets/gallery/slide/board-on-board-with-trim-rails-scaled.jpg", category: "wood", alt: "Wood fence privacy project" },
    { src: "/assets/gallery/slide/Vinyl-Fence-Panels-The-Glacier-Line-BarrierBoss-37941654257965_1066x.webp", category: "vinyl", alt: "Vinyl privacy fence panel" },
    { src: "/assets/gallery/slide/chain_link_fence_2-1024x768.webp", category: "chain-link", alt: "Chain link fencing installation" },
    { src: "/assets/gallery/slide/barrette-outdoor-living-metal-fence-panels-73003515-1f_600.avif", category: "aluminum", alt: "Aluminum panel fence" }
  ];

  return {
    PHONE_RAW,
    PHONE_PRETTY,
    EMAIL,
    ADDRESS,
    nav,
    sharedReviews,
    materialPages,
    pageAssets,
    sharedFaq,
    galleryItems
  };
})();
