import fs from "node:fs";
import path from "node:path";

const base = path.resolve("extracted/current-site");
const out = path.resolve("public/current-site-content.js");

const configs = {
  "wood-fence": {
    file: "wood.txt",
    start: "Wood Fence Installation for Your Boston Metro Home",
    end: "Reviews",
    headings: [
      "Wood Fence Installation for Your Boston Metro Home",
      "Why You Might Need a Wood Fence",
      "Why Choose BlueBird Fence",
      "The Timeless Appeal of Wood Fencing for Every Property",
      "Choosing the Right Type of Wood for Your Fence",
      "How Professional Installation Enhances Fence Longevity",
      "Custom Wood Fence Designs That Reflect Your Style",
      "Maintenance Tips to Preserve the Beauty of Your Wood Fence",
      "How Wood Fencing Balances Privacy, Security, and Charm",
      "Comparing Wood Fences to Other Popular Fencing Materials",
      "Sustainable and Eco-Friendly Benefits of Wood Fences",
      "Contact Us",
      "How long does it typically take to install a wood fence?",
      "What types of wood do you recommend for fences in the Boston Metro area?",
      "Do I need a permit to install a wood fence on my property?"
    ]
  },
  "vinyl-fence": {
    file: "vinyl.txt",
    start: "Vinyl Fence Installation: Enhance Your Property with Durability and Style",
    end: "Reviews",
    headings: [
      "Vinyl Fence Installation: Enhance Your Property with Durability and Style",
      "Why Consider Vinyl Fence Installation?",
      "Why Choose One of the Leading Fence Companies in Chelmsford, MA",
      "The Benefits of Choosing Vinyl Over Traditional Fencing Materials",
      "How Professional Installation Ensures Lasting Performance",
      "Customizing Vinyl Fences to Match Your Property’s Aesthetic",
      "The Role of Vinyl Fencing in Privacy and Security",
      "Low Maintenance, High Value: The Practical Advantages of Vinyl",
      "Designing Vinyl Fences for Residential and Commercial Properties",
      "Contact Us",
      "How long does a vinyl fence installation typically take?",
      "Is vinyl fencing more expensive than other fencing materials?",
      "Can vinyl fencing be customized to match my property's style?"
    ]
  },
  "chain-link-fence": {
    file: "chain-link.txt",
    start: "Chain Link Fence Installation for Greater Boston Metro Area",
    end: "Reviews",
    headings: [
      "Chain Link Fence Installation for Greater Boston Metro Area",
      "Why Consider Chain Link Fence Installation?",
      "Choosing the Right Materials",
      "Security and Compliance",
      "Why Choose BlueBird Fence",
      "Contact Us",
      "How long does it typically take to install a chain link fence?",
      "Can chain link fences be customized for privacy?",
      "Do I need a permit to install a chain link fence in the Boston Metro area?"
    ]
  },
  "aluminum-fence": {
    file: "aluminum.txt",
    start: "Aluminum Fence Installation: Enhance Your Property with Durability and Style",
    end: "Reviews",
    headings: [
      "Aluminum Fence Installation: Enhance Your Property with Durability and Style",
      "Why Consider Aluminum Fence Installation?",
      "Understanding the Benefits of Professional Fence Installation",
      "Choosing the Right Fence for Your Property",
      "Why Choose BlueBird Fence",
      "Contact Us",
      "How long does it typically take to install an aluminum fence?",
      "Is aluminum fencing a good option for pool enclosures?",
      "Can aluminum fencing be customized to match my property's aesthetic?"
    ]
  },
  "temporary-fence": {
    file: "temporary.txt",
    start: "Temporary Fence Installation for Your Project Needs",
    end: "Reviews",
    headings: [
      "Temporary Fence Installation for Your Project Needs",
      "Why You May Need Temporary Fence Installation",
      "Why Choose BlueBird Fence",
      "Contact Us",
      "How quickly can BlueBird Fence install temporary fencing?",
      "What types of temporary fencing does BlueBird Fence offer?",
      "Is a permit required for temporary fence installation in the Boston Metro area?"
    ]
  }
};

function linesFor(file) {
  return fs.readFileSync(path.join(base, file), "utf8").split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
}

function sectionize(config) {
  const all = linesFor(config.file);
  const start = all.indexOf(config.start);
  const end = all.indexOf(config.end, start);
  const body = all.slice(start, end === -1 ? undefined : end);
  const sections = [];
  let current = null;
  for (const line of body) {
    if (config.headings.includes(line)) {
      current = { title: line, lines: [] };
      sections.push(current);
    } else if (current) {
      current.lines.push(line);
    }
  }
  return sections;
}

function aboutContent() {
  const all = linesFor("about.txt");
  const start = all.indexOf("BlueBird Fence Inc", all.indexOf("Home"));
  const end = all.indexOf("Privacy Policy", start);
  return all.slice(start, end === -1 ? undefined : end);
}

const materialContent = Object.fromEntries(
  Object.entries(configs).map(([key, config]) => [key, sectionize(config)])
);

const localGalleryPath = path.join(base, "gallery-local-images.json");
const galleryImages = fs.existsSync(localGalleryPath)
  ? JSON.parse(fs.readFileSync(localGalleryPath, "utf8"))
  : [];

const output = `window.BlueBirdCurrentContent = ${JSON.stringify({
  materialContent,
  about: aboutContent(),
  galleryImages
}, null, 2)};\n`;

fs.writeFileSync(out, output);
console.log(`wrote ${out}`);
