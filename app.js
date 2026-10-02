const STORAGE_KEY = "devshelf-demo";
const initialData = {
  projects: [
    { name: "TaskFlow", description: "A simple, focused task manager.", tags: "React · JavaScript", color: "#7c5cff" },
    { name: "ShopLite", description: "A lightweight online storefront.", tags: "HTML · CSS · JavaScript", color: "#f59e0b" },
    { name: "Weatherly", description: "Local forecasts using a weather API.", tags: "JavaScript · API", color: "#3b82f6" },
  ],
  software: [
    { name: "VS Code Extensions Pack", detail: "Collection · v2.1" },
    { name: "Image Optimizer", detail: "Utility · v1.4" },
    { name: "Portfolio Resume", detail: "PDF · Updated recently" },
  ],
};

let data;
try {
  data = JSON.parse(localStorage.getItem(STORAGE_KEY)) || initialData;
} catch {
  data = initialData;
}

let currentPage = "Overview";

document.head.insertAdjacentHTML("beforeend", `
  <style>
    * { box-sizing: border-box }
    body { margin: 0; background: #f6f7fb; color: #202336; font: 15px/1.5 Inter, system-ui, sans-serif }
    button, input { font: inherit }
    button { cursor: pointer }
    .layout { min-height: 100vh; display: grid; grid-template-columns: 230px 1fr }
    aside { background: #fff; border-right: 1px solid #e9eaf0; padding: 26px 16px }
    .brand { font-size: 21px; font-weight: 800; padding: 0 12px 34px; color: #6548e8 }
    .nav-label { color: #9799a8; font-size: 11px; font-weight: 700; letter-spacing: 1px; padding: 14px 12px 8px }
    .nav-button { border: 0; background: transparent; color: #66697a; width: 100%; text-align: left; padding: 11px 12px; border-radius: 9px; margin: 2px 0 }
    .nav-button:hover, .nav-button.active { background: #f0edff; color: #6548e8 }
    main { min-width: 0; padding: 26px 4vw 50px }
    .topbar { display: flex; align-items: center; justify-content: space-between; gap: 18px; margin-bottom: 38px }
    .search { width: min(390px, 55vw); border: 1px solid #e5e6ed; background: white; border-radius: 9px; padding: 11px 14px }
    .user { color: #55586a; font-weight: 600 }
    .welcome { display: flex; justify-content: space-between; align-items: center; gap: 20px; margin-bottom: 28px }
    h1 { font-size: 27px; margin: 0 0 5px }
    p { color: #858797; margin: 0 }
    .primary { border: 0; border-radius: 8px; padding: 11px 16px; background: #6548e8; color: white; font-weight: 650 }
    .primary:hover { background: #5238ce }
    .section-title { display: flex; justify-content: space-between; align-items: center; margin: 29px 0 13px }
    h2 { font-size: 16px; margin: 0 }
    .storage, .software-list, .card { background: white; border: 1px solid #ececf2; border-radius: 12px }
    .storage { padding: 18px 20px }
    .storage-top { display: flex; justify-content: space-between; margin-bottom: 12px }
    .muted { color: #898b99 }
    .track { height: 9px; background: #eeeef4; border-radius: 10px; overflow: hidden }
    .fill { width: 42%; height: 100%; background: linear-gradient(90deg,#6548e8,#9b70ff); border-radius: inherit }
    .grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 15px }
    .card { padding: 18px; min-height: 150px }
    .project-icon { width: 38px; height: 38px; border-radius: 11px; margin-bottom: 13px }
    .card h3 { margin: 0 0 5px; font-size: 16px }
    .card p { font-size: 13px; min-height: 39px }
    .tags { color: #77798a; font-size: 12px; margin-top: 10px }
    .software-list { overflow: hidden }
    .software-row { display: flex; justify-content: space-between; gap: 10px; padding: 15px 18px; border-bottom: 1px solid #f0f0f4 }
    .software-row:last-child { border-bottom: 0 }
    .software-name { font-weight: 650 }
    .empty { background: white; border: 1px dashed #d9dae4; border-radius: 12px; padding: 28px; text-align: center; color: #858797 }
    @media (max-width: 800px) { .layout { grid-template-columns: 1fr } aside { padding: 14px; border-right: 0; border-bottom: 1px solid #e9eaf0 } .brand { padding: 0 8px 10px } .nav-label { display: none } aside nav { display: flex; overflow-x: auto } .nav-button { width: auto; white-space: nowrap } main { padding: 22px 18px } .grid { grid-template-columns: 1fr 1fr } }
    @media (max-width: 520px) { .grid { grid-template-columns: 1fr } .welcome { align-items: flex-start; flex-direction: column } .topbar { margin-bottom: 25px } }
  </style>
`);

document.body.innerHTML = `
  <div class="layout">
    <aside>
      <div class="brand">◈ DevShelf</div>
      <nav>
        <div class="nav-label">WORKSPACE</div>
        <button class="nav-button active" data-page="Overview">◫ &nbsp; Overview</button>
        <button class="nav-button" data-page="Portfolio">◧ &nbsp; Portfolio</button>
        <button class="nav-button" data-page="Software">▤ &nbsp; Software</button>
        <button class="nav-button" data-page="Files">◇ &nbsp; Files</button>
        <div class="nav-label">COLLECTIONS</div>
        <button class="nav-button" data-page="Featured">☆ &nbsp; Featured</button>
      </nav>
    </aside>
    <main>
      <div class="topbar">
        <input class="search" id="search" placeholder="Search projects and software..." aria-label="Search">
        <div class="user">🔔 &nbsp; Alex Morgan</div>
      </div>
      <div id="content"></div>
    </main>
  </div>
`;

const content = document.querySelector("#content");

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;",
  })[char]);
}

function render() {
  const query = document.querySelector("#search").value.trim().toLowerCase();
  const projects = data.projects.filter((item) =>
    `${item.name} ${item.description} ${item.tags}`.toLowerCase().includes(query)
  );
  const software = data.software.filter((item) =>
    `${item.name} ${item.detail}`.toLowerCase().includes(query)
  );

  const showProjects = ["Overview", "Portfolio", "Featured"].includes(currentPage);
  const showSoftware = ["Overview", "Software"].includes(currentPage);

  content.innerHTML = `
    <div class="welcome">
      <div><h1>Good morning, Alex 👋</h1><p>Your work, organized in one place.</p></div>
      <button class="primary" id="add-project">＋ Add project</button>
    </div>

    ${currentPage === "Overview" ? `
      <div class="section-title"><h2>Storage</h2></div>
      <section class="storage">
        <div class="storage-top"><strong>4.2 GB of 10 GB used</strong><span class="muted">42%</span></div>
        <div class="track"><div class="fill"></div></div>
      </section>` : ""}

    ${showProjects ? `
      <div class="section-title"><h2>${currentPage === "Overview" ? "Recent projects" : currentPage}</h2><span class="muted">${projects.length} projects</span></div>
      ${projects.length ? `<div class="grid">${projects.map((project) => `
        <article class="card">
          <div class="project-icon" style="background:${escapeHTML(project.color)}"></div>
          <h3>${escapeHTML(project.name)}</h3>
          <p>${escapeHTML(project.description)}</p>
          <div class="tags">${escapeHTML(project.tags)}</div>
        </article>`).join("")}</div>` : `<div class="empty">No matching projects yet.</div>`}
    ` : ""}

    ${showSoftware ? `
      <div class="section-title"><h2>Software library</h2><button class="primary" id="add-software">＋ Add software</button></div>
      ${software.length ? `<div class="software-list">${software.map((item) => `
        <div class="software-row"><span class="software-name">📦 &nbsp; ${escapeHTML(item.name)}</span><span class="muted">${escapeHTML(item.detail)}</span></div>
      `).join("")}</div>` : `<div class="empty">No matching software entries.</div>`}
    ` : ""}

    ${currentPage === "Files" ? `<div class="section-title"><h2>Files</h2></div><div class="empty">File uploads will be available when a secure storage backend is connected.</div>` : ""}
  `;

  document.querySelector("#add-project")?.addEventListener("click", () => {
    const name = prompt("Project name:");
    if (!name?.trim()) return;
    const description = prompt("Short description:") || "Project description";
    const tags = prompt("Technologies (for example, JavaScript · React):") || "JavaScript";
    data.projects.unshift({ name: name.trim(), description, tags, color: "#7c5cff" });
    save();
    render();
  });

  document.querySelector("#add-software")?.addEventListener("click", () => {
    const name = prompt("Software or file name:");
    if (!name?.trim()) return;
    const detail = prompt("Type or version:") || "Software";
    data.software.unshift({ name: name.trim(), detail });
    save();
    render();
  });
}

document.querySelectorAll("[data-page]").forEach((button) => {
  button.addEventListener("click", () => {
    currentPage = button.dataset.page;
    document.querySelectorAll("[data-page]").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    render();
  });
});

document.querySelector("#search").addEventListener("input", render);
render();
