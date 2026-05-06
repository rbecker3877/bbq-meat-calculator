// Helper
function $(id) {
  return document.getElementById(id);
}

// THEME HANDLING
const THEME_KEY = "bbqCalcTheme";

function applyTheme(themeClass) {
  document.body.classList.remove("theme-clean", "theme-bbq", "theme-dark");
  document.body.classList.add(themeClass);
  localStorage.setItem(THEME_KEY, themeClass);
}

(function initTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  const theme = saved || "theme-clean";
  applyTheme(theme);
  $("themeSelect").value = theme;
})();

$("themeSelect").addEventListener("change", (e) => {
  applyTheme(e.target.value);
});

// TABS
$("tabSimple").addEventListener("click", () => {
  $("tabSimple").classList.add("active");
  $("tabAdvanced").classList.remove("active");
  $("simpleMode").classList.add("active");
  $("advancedMode").classList.remove("active");
});

$("tabAdvanced").addEventListener("click", () => {
  $("tabAdvanced").classList.add("active");
  $("tabSimple").classList.remove("active");
  $("advancedMode").classList.add("active");
  $("simpleMode").classList.remove("active");
});

// SIMPLE MODE

$("simpleBuffer").addEventListener("input", () => {
  $("simpleBufferValue").textContent = $("simpleBuffer").value;
});

$("simpleCrowdPreset").addEventListener("change", () => {
  if ($("simpleCrowdPreset").checked) {
    $("simplePorkPct").value = 60;
    $("simpleChickenPct").value = 40;
    $("simpleServing").value = 0.75; // no-sides baseline; sides dropdown applies reduction
  }
});

$("simpleCalcBtn").addEventListener("click", () => {
  const people = parseFloat($("simplePeople").value) || 0;
  let porkPct = parseFloat($("simplePorkPct").value) || 0;
  let chickenPct = parseFloat($("simpleChickenPct").value) || 0;
  const serving = parseFloat($("simpleServing").value) || 0;
  const bufferPct = parseFloat($("simpleBuffer").value) || 0;
  const sideReduction = parseFloat($("simpleSides").value) || 0;

  if (people <= 0 || serving <= 0) {
    $("simpleResults").textContent = "Please enter valid people and serving size.";
    return;
  }

  const totalPct = porkPct + chickenPct;
  if (totalPct <= 0) {
    $("simpleResults").textContent = "Meat percentages must be greater than 0.";
    return;
  }

  porkPct = porkPct / totalPct;
  chickenPct = chickenPct / totalPct;

  const bufferFactor = 1 + bufferPct / 100;
  const sideFactor = 1 - sideReduction;

  const porkPeople = people * porkPct;
  const chickenPeople = people * chickenPct;

  const porkCooked = porkPeople * serving * bufferFactor * sideFactor;
  const chickenCooked = chickenPeople * serving * bufferFactor * sideFactor;

  const porkYield = 0.55;
  const chickenYield = 0.78;

  const porkRaw = porkCooked / porkYield;
  const chickenRaw = chickenCooked / chickenYield;

  const totalCooked = porkCooked + chickenCooked;
  const avgCookedPerPerson = totalCooked / people;

  const lines = [];
  lines.push(`People: ${people}`);
  lines.push(`Buffer: ${bufferPct.toFixed(0)}%`);
  lines.push(`Side reduction: ${(sideReduction * 100).toFixed(0)}%`);
  lines.push("");

  if (porkPct > 0) {
    lines.push("Pork:");
    lines.push(`  People share: ${porkPeople.toFixed(1)}`);
    lines.push(`  Cooked:       ${porkCooked.toFixed(1)} lb`);
    lines.push(`  Raw:          ${porkRaw.toFixed(1)} lb`);
    lines.push("");
  }

  if (chickenPct > 0) {
    lines.push("Chicken:");
    lines.push(`  People share: ${chickenPeople.toFixed(1)}`);
    lines.push(`  Cooked:       ${chickenCooked.toFixed(1)} lb`);
    lines.push(`  Raw:          ${chickenRaw.toFixed(1)} lb`);
    lines.push("");
  }

  lines.push(`Total cooked (pork + chicken): ${totalCooked.toFixed(1)} lb`);
  lines.push(`Average cooked per person: ${avgCookedPerPerson.toFixed(2)} lb`);

  $("simpleResults").textContent = lines.join("\n");
});

// ADVANCED MODE

$("advBuffer").addEventListener("input", () => {
  $("advBufferValue").textContent = $("advBuffer").value;
});

$("advSides").addEventListener("input", () => {
  const sides = parseInt($("advSides").value, 10) || 0;
  const reduction = Math.min(sides * 0.06, 0.30);
  $("advSidesValue").textContent = sides;
  $("advSidesReductionValue").textContent = (reduction * 100).toFixed(0);
});

$("advCrowdPreset").addEventListener("change", () => {
  if ($("advCrowdPreset").checked) {
    $("advStandardPreset").checked = false;
    $("advPorkPct").value = 60;
    $("advChickenPct").value = 40;
    $("advBrisketPct").value = 0;
    $("advRibsPct").value = 0;
    $("advPorkServing").value = 0.55;
    $("advChickenServing").value = 0.50;
    $("advBrisketServing").value = 0.65;
    $("advRibBones").value = 5;
  }
});

$("advStandardPreset").addEventListener("change", () => {
  if ($("advStandardPreset").checked) {
    $("advCrowdPreset").checked = false;
    $("advPorkPct").value = 40;
    $("advChickenPct").value = 30;
    $("advBrisketPct").value = 20;
    $("advRibsPct").value = 10;
    $("advPorkServing").value = 0.55;
    $("advChickenServing").value = 0.50;
    $("advBrisketServing").value = 0.65;
    $("advRibBones").value = 5;
  }
});

$("advCalcBtn").addEventListener("click", () => {
  const people = parseFloat($("advPeople").value) || 0;
  if (people <= 0) {
    $("advResults").textContent = "Please enter a valid number of people.";
    $("advSummary").textContent = "";
    return;
  }

  let porkPct = parseFloat($("advPorkPct").value) || 0;
  let chickenPct = parseFloat($("advChickenPct").value) || 0;
  let brisketPct = parseFloat($("advBrisketPct").value) || 0;
  let ribsPct = parseFloat($("advRibsPct").value) || 0;

  let totalPct = porkPct + chickenPct + brisketPct + ribsPct;
  if (totalPct <= 0) {
    $("advResults").textContent = "Total meat percentage must be greater than 0.";
    $("advSummary").textContent = "";
    return;
  }

  porkPct /= totalPct;
  chickenPct /= totalPct;
  brisketPct /= totalPct;
  ribsPct /= totalPct;

  const porkServing = parseFloat($("advPorkServing").value) || 0;
  const chickenServing = parseFloat($("advChickenServing").value) || 0;
  const brisketServing = parseFloat($("advBrisketServing").value) || 0;
  const ribBonesPerPerson = parseFloat($("advRibBones").value) || 0;

  const porkYield = parseFloat($("advPorkYield").value) || 0.55;
  const chickenYield = parseFloat($("advChickenYield").value) || 0.78;
  const brisketYield = parseFloat($("advBrisketYield").value) || 0.5;
  const ribRackWeight = parseFloat($("advRibRackWeight").value) || 2.75;

  const bufferPct = parseFloat($("advBuffer").value) || 0;
  const bufferFactor = 1 + bufferPct / 100;

  const sides = parseInt($("advSides").value, 10) || 0;
  const sideReduction = Math.min(sides * 0.06, 0.30);
  const sideFactor = 1 - sideReduction;

  // People per meat
  const porkPeople = people * porkPct;
  const chickenPeople = people * chickenPct;
  const brisketPeople = people * brisketPct;
  const ribsPeople = people * ribsPct;

  // Cooked weights (with buffer + sides)
  const porkCooked = porkPeople * porkServing * bufferFactor * sideFactor;
  const chickenCooked = chickenPeople * chickenServing * bufferFactor * sideFactor;
  const brisketCooked = brisketPeople * brisketServing * bufferFactor * sideFactor;

  // Ribs: bones -> racks -> raw
  const totalRibBones = ribsPeople * ribBonesPerPerson * bufferFactor * sideFactor;
  const ribRacks = totalRibBones / 12.0;
  const ribRaw = ribRacks * ribRackWeight;

  // Raw weights
  const porkRaw = porkCooked / porkYield;
  const chickenRaw = chickenCooked / chickenYield;
  const brisketRaw = brisketCooked / brisketYield;

  const totalRaw = porkRaw + chickenRaw + brisketRaw + ribRaw;
  const totalCooked = porkCooked + chickenCooked + brisketCooked;
  const avgCookedPerPerson = totalCooked / people;

  const lines = [];
  lines.push(`People: ${people}`);
  lines.push(`Buffer: ${bufferPct.toFixed(0)}%`);
  lines.push(`Side reduction: ${(sideReduction * 100).toFixed(0)}%`);
  lines.push("");

  if (porkPct > 0) {
    lines.push("Pork:");
    lines.push(`  People share: ${porkPeople.toFixed(1)}`);
    lines.push(`  Cooked:       ${porkCooked.toFixed(1)} lb`);
    lines.push(`  Raw:          ${porkRaw.toFixed(1)} lb`);
    lines.push("");
  }

  if (chickenPct > 0) {
    lines.push("Chicken:");
    lines.push(`  People share: ${chickenPeople.toFixed(1)}`);
    lines.push(`  Cooked:       ${chickenCooked.toFixed(1)} lb`);
    lines.push(`  Raw:          ${chickenRaw.toFixed(1)} lb`);
    lines.push("");
  }

  if (brisketPct > 0) {
    lines.push("Brisket:");
    lines.push(`  People share: ${brisketPeople.toFixed(1)}`);
    lines.push(`  Cooked:       ${brisketCooked.toFixed(1)} lb`);
    lines.push(`  Raw:          ${brisketRaw.toFixed(1)} lb`);
    lines.push("");
  }

  if (ribsPct > 0) {
    lines.push("Ribs:");
    lines.push(`  People share: ${ribsPeople.toFixed(1)}`);
    lines.push(`  Bones/person: ${ribBonesPerPerson.toFixed(0)}`);
    lines.push(`  Total bones:  ${totalRibBones.toFixed(0)}`);
    lines.push(`  Racks:        ${ribRacks.toFixed(1)} (12 bones/rack)`);
    lines.push(`  Raw:          ${ribRaw.toFixed(1)} lb (at ${ribRackWeight.toFixed(2)} lb/rack)`);
    lines.push("");
  }

  lines.push(`Total cooked (no ribs): ${totalCooked.toFixed(1)} lb`);
  lines.push(`Average cooked per person (no ribs): ${avgCookedPerPerson.toFixed(2)} lb`);

  $("advResults").textContent = lines.join("\n");

  const summary = [];
  summary.push("Raw meat to buy:");
  if (porkPct > 0) summary.push(`  Pork:    ${porkRaw.toFixed(1)} lb`);
  if (chickenPct > 0) summary.push(`  Chicken: ${chickenRaw.toFixed(1)} lb`);
  if (brisketPct > 0) summary.push(`  Brisket: ${brisketRaw.toFixed(1)} lb`);
  if (ribsPct > 0) summary.push(`  Ribs:    ${ribRaw.toFixed(1)} lb (${ribRacks.toFixed(1)} racks)`);
  summary.push("");
  summary.push(`Total raw weight:    ${totalRaw.toFixed(1)} lb`);
  summary.push(`Total cooked (no ribs): ${totalCooked.toFixed(1)} lb`);

  $("advSummary").textContent = summary.join("\n");
});
