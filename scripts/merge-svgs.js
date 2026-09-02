const fs = require("fs");
const s1 = fs.readFileSync("C:/Users/lulus/Downloads/NOVA_Figma_Design_Kit/01_AI_Planner_Search.svg", "utf8");
const s2 = fs.readFileSync("C:/Users/lulus/Downloads/NOVA_Figma_Design_Kit/02_AI_Planner_Itinerary_Bali.svg", "utf8");
const s3 = fs.readFileSync("C:/Users/lulus/Downloads/NOVA_Figma_Design_Kit/03_Booking_Modal_Overlay.svg", "utf8");

function getInner(svg) {
  return svg.replace(/<\?xml.*?\?>/i, "")
            .replace(/<svg[^>]*>/i, "")
            .replace(/<\/svg>/i, "");
}

const masterSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 4600 1500" width="4600" height="1500" style="background:#F1F5F9;font-family:'Plus Jakarta Sans',Inter,sans-serif;">
  <!-- SCREEN 1: SEARCH & HERO -->
  <g id="Screen_1_Search" transform="translate(50, 50)">
    ${getInner(s1)}
  </g>

  <!-- SCREEN 2: BALI 3-DAY ITINERARY -->
  <g id="Screen_2_Itinerary_Bali" transform="translate(1550, 50)">
    ${getInner(s2)}
  </g>

  <!-- SCREEN 3: BOOKING MODAL -->
  <g id="Screen_3_Booking_Modal" transform="translate(3050, 50)">
    ${getInner(s3)}
  </g>
</svg>`;

fs.writeFileSync("C:/Users/lulus/Downloads/NOVA_Figma_Design_Kit/ALL_SCREENS_PROTOTYPE.svg", masterSvg, "utf8");
console.log("Master SVG created! Bytes:", masterSvg.length);
