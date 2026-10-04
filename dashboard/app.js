// Check if user is logged in
const token = localStorage.getItem("token");
if (!token) {
    window.location.href = "../login.html";
}

// App State
let selectedId = null;
let interviewsData = [];
let candidateProfile = {};

// DOM Ready
document.addEventListener("DOMContentLoaded", async () => {
    await loadDashboardData();
    renderChart();
    renderTimeline();
    setupArrows();
    setupDragScroll();
    setupModal();

    if (interviewsData.length > 0) {
        selectInterview(interviewsData[0].id);
    }
});

// Fetch dashboard data from backend
async function loadDashboardData() {
    try {
        const response = await fetch("http://localhost:5000/api/dashboard", {
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        const data = await response.json();

        candidateProfile = {
            name: data.name,
            tagline: "Keep Practicing! 💪",
            lastInterview: data.interviews.length > 0
                ? new Date(data.interviews[0].createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
                : "No interviews yet",
            avatar: data.name.charAt(0).toUpperCase(),
            averageScore: data.averageScore,
            totalInterviews: data.totalInterviews,
            successRate: data.successRate
        };

        interviewsData = data.interviews.map(interview => ({
            id: interview._id,
            role: interview.role,
            difficulty: interview.difficulty,
            date: interview.createdAt,
            score: interview.score,
            rating: interview.rating,
            status: interview.status,
            feedback: interview.feedback,
            strengths: interview.strengths,
            weaknesses: interview.weaknesses,
            conversation: interview.conversation
        }));

        loadProfile();

    } catch (error) {
        console.error("Failed to load dashboard:", error);
    }
}

// Load profile info into header
function loadProfile() {
    document.getElementById("candidate-name").textContent = candidateProfile.name;
    document.getElementById("candidate-tagline").textContent = candidateProfile.tagline;
    document.getElementById("candidate-last").textContent = "Last Interview: " + candidateProfile.lastInterview;
    document.getElementById("candidate-avatar").textContent = candidateProfile.avatar;
    document.getElementById("metric-avg-score").textContent = candidateProfile.averageScore;
    document.getElementById("metric-avg-fill").style.width = candidateProfile.averageScore + "%";
    document.getElementById("metric-total-int").textContent = candidateProfile.totalInterviews;
    document.getElementById("metric-success-rate").textContent = candidateProfile.successRate;
}

// Draw performance graph
function renderChart() {
    const svg = document.getElementById("performance-chart");
    svg.innerHTML = "";

    const W = svg.clientWidth || 1000;
    const H = 240;
    const pad = { top: 30, bottom: 50, left: 50, right: 30 };

    const data = [...interviewsData].sort((a, b) => new Date(a.date) - new Date(b.date));
    const scores = data.map(d => d.score);
    const minScore = 0;
    const maxScore = 100;

    // Scale functions
    const xPos = (i) => pad.left + (i / (data.length - 1)) * (W - pad.left - pad.right);
    const yPos = (s) => pad.top + ((maxScore - s) / (maxScore - minScore)) * (H - pad.top - pad.bottom);

    // Gradient fill definition
    const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    defs.innerHTML = `
        <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#7c6ff7" stop-opacity="0.4"/>
            <stop offset="100%" stop-color="#7c6ff7" stop-opacity="0"/>
        </linearGradient>
    `;
    svg.appendChild(defs);

    // Y axis grid lines
    [25, 50, 75, 100].forEach(val => {
        const y = yPos(val);
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", pad.left);
        line.setAttribute("x2", W - pad.right);
        line.setAttribute("y1", y);
        line.setAttribute("y2", y);
        line.setAttribute("stroke", "#2a2a3d");
        line.setAttribute("stroke-width", "1");
        svg.appendChild(line);

        const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
        label.setAttribute("x", pad.left - 8);
        label.setAttribute("y", y + 4);
        label.setAttribute("text-anchor", "end");
        label.setAttribute("fill", "#666");
        label.setAttribute("font-size", "11");
        label.textContent = val;
        svg.appendChild(label);
    });

    // Smooth curve path points
    const points = data.map((d, i) => ({ x: xPos(i), y: yPos(d.score) }));

    // Build smooth curve using bezier
    let pathD = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
        const prev = points[i - 1];
        const curr = points[i];
        const cpX = (prev.x + curr.x) / 2;
        pathD += ` C ${cpX} ${prev.y}, ${cpX} ${curr.y}, ${curr.x} ${curr.y}`;
    }

    // Fill area under curve
    let fillD = pathD;
    fillD += ` L ${points[points.length - 1].x} ${H - pad.bottom}`;
    fillD += ` L ${points[0].x} ${H - pad.bottom} Z`;

    const fill = document.createElementNS("http://www.w3.org/2000/svg", "path");
    fill.setAttribute("d", fillD);
    fill.setAttribute("fill", "url(#chartGradient)");
    svg.appendChild(fill);

    // Line
    const line = document.createElementNS("http://www.w3.org/2000/svg", "path");
    line.setAttribute("d", pathD);
    line.setAttribute("fill", "none");
    line.setAttribute("stroke", "#7c6ff7");
    line.setAttribute("stroke-width", "2.5");
    svg.appendChild(line);

    // Dots + labels
    data.forEach((d, i) => {
        const x = points[i].x;
        const y = points[i].y;

        // X axis date label
        const dateLabel = document.createElementNS("http://www.w3.org/2000/svg", "text");
        dateLabel.setAttribute("x", x);
        dateLabel.setAttribute("y", H - pad.bottom + 20);
        dateLabel.setAttribute("text-anchor", "middle");
        dateLabel.setAttribute("fill", "#666");
        dateLabel.setAttribute("font-size", "11");
        dateLabel.textContent = new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
        svg.appendChild(dateLabel);

        // Dot
        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("cx", x);
        circle.setAttribute("cy", y);
        circle.setAttribute("r", "6");
        circle.setAttribute("fill", "#7c6ff7");
        circle.setAttribute("stroke", "#0f0f1a");
        circle.setAttribute("stroke-width", "2");
        circle.setAttribute("class", "chart-dot");
        circle.setAttribute("data-id", d.id);
        circle.style.cursor = "pointer";

        circle.addEventListener("click", () => selectInterview(d.id));
        circle.addEventListener("mouseenter", () => {
            circle.setAttribute("r", "9");
        });
        circle.addEventListener("mouseleave", () => {
            circle.setAttribute("r", selectedId === d.id ? "9" : "6");
        });

        svg.appendChild(circle);
    });
}

// Render horizontal timeline
function renderTimeline() {
    const monthsBar = document.getElementById("timeline-months-bar");
    const gridBar = document.getElementById("timeline-grid-bar");
    const nodesBar = document.getElementById("timeline-nodes-bar");

    monthsBar.innerHTML = "";
    gridBar.innerHTML = "";
    nodesBar.innerHTML = "";

    const data = [...interviewsData].sort((a, b) => new Date(a.date) - new Date(b.date));

    const dates = data.map(d => new Date(d.date));
    const minDate = new Date(Math.min(...dates));
    const maxDate = new Date(Math.max(...dates));
    minDate.setDate(minDate.getDate() - 10);
    maxDate.setDate(maxDate.getDate() + 10);

    const totalDays = (maxDate - minDate) / (1000 * 60 * 60 * 24);

    // FIX: minimum spacing between nodes so overlapping/same-day interviews
    // never collide.
    const minSpacing = 90; // minimum px between two timeline nodes
    const edgePadding = 60; // breathing room after the last node

    // Provisional width, before we know how far the bumping below pushes
    // the last node.
    let trackWidth = Math.max(900, totalDays * 30, data.length * minSpacing);

    // FIX: compute every node's position FIRST (using the provisional
    // width), then check whether the last (bumped) node lands past the
    // provisional width. If it does, grow trackWidth to fit it — this is
    // what stops the last node from sticking out past the end of the line.
    const positions = [];
    let lastLeft = -Infinity;

    data.forEach(d => {
        const date = new Date(d.date);
        let left = ((date - minDate) / (maxDate - minDate)) * trackWidth;

        if (left - lastLeft < minSpacing) {
            left = lastLeft + minSpacing;
        }
        lastLeft = left;
        positions.push(left);
    });

    const neededWidth = lastLeft + edgePadding;
    if (neededWidth > trackWidth) {
        trackWidth = neededWidth;
    }

    [monthsBar, gridBar, nodesBar].forEach(el => {
        el.style.width = trackWidth + "px";
    });

    // Month labels (uses the FINAL trackWidth, so proportions line up with
    // the possibly-widened track)
    let current = new Date(minDate);
    current.setDate(1);
    while (current <= maxDate) {
        // FIX: clamp to 0 so the first month (which can fall before the
        // padded minDate) still renders at the left edge instead of at a
        // negative offset where it's invisible.
        const rawLeft = ((current - minDate) / (maxDate - minDate)) * trackWidth;
        const left = Math.max(0, rawLeft);
        const label = document.createElement("div");
        label.className = "month-label";
        label.style.left = left + "px";
        label.textContent = current.toLocaleDateString("en-US", { month: "short", year: "numeric" });
        monthsBar.appendChild(label);
        current.setMonth(current.getMonth() + 1);
    }

    // Timeline line (100% of gridBar, which is now sized to fit every node)
    const line = document.createElement("div");
    line.className = "timeline-line";
    gridBar.appendChild(line);

    // Interview nodes — use the already-computed (and now guaranteed to
    // fit) positions array instead of recalculating.
    data.forEach((d, i) => {
        const left = positions[i];

        const node = document.createElement("div");
        node.className = "timeline-node";
        node.setAttribute("data-id", d.id);
        node.style.left = left + "px";

        const dot = document.createElement("div");
        dot.className = "node-dot";

        const label = document.createElement("div");
        label.className = "node-label";
        label.textContent = new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" });

        node.appendChild(dot);
        node.appendChild(label);

        // Hover tooltip
        node.addEventListener("mouseenter", () => showTooltip(node, d));
        node.addEventListener("mouseleave", hideTooltip);
        node.addEventListener("click", () => selectInterview(d.id));

        nodesBar.appendChild(node);
    });
}

// Show tooltip on timeline hover
function showTooltip(node, d) {
    const tooltip = document.getElementById("global-tooltip");
    document.getElementById("tooltip-company").textContent = d.role;
    document.getElementById("tooltip-date").textContent = new Date(d.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
    document.getElementById("tooltip-score").textContent = d.score + "/100";

    const statusEl = document.getElementById("tooltip-status");
    statusEl.textContent = d.status;
    statusEl.className = "badge " + (d.status === "Passed" ? "badge-passed" : "badge-rejected");

    const rect = node.getBoundingClientRect();
    const outer = document.querySelector(".timeline-slider-outer").getBoundingClientRect();
    tooltip.style.left = (rect.left - outer.left) + "px";
    tooltip.style.top = (rect.top - outer.top - 90) + "px";
    tooltip.classList.add("visible");
}

// Hide tooltip
function hideTooltip() {
    document.getElementById("global-tooltip").classList.remove("visible");
}

// Select interview and show detail panel
function selectInterview(id) {
    selectedId = id;
    const item = interviewsData.find(d => d.id === id);
    if (!item) return;

    // Highlight active node
    document.querySelectorAll(".timeline-node").forEach(n => {
        n.classList.toggle("active", n.getAttribute("data-id") === id);
    });

    // Highlight active chart dot
    document.querySelectorAll(".chart-dot").forEach(dot => {
        dot.setAttribute("r", dot.getAttribute("data-id") === id ? "9" : "6");
    });

    // Show detail card
    document.getElementById("details-placeholder").classList.add("hidden");
    document.getElementById("details-card").classList.remove("hidden");

    // Fill detail card
    document.getElementById("details-logo").textContent = item.role.charAt(0);
    document.getElementById("details-company").textContent = item.role;
    document.getElementById("details-role").textContent = item.difficulty;
    document.getElementById("details-score").textContent = item.score;
    document.getElementById("details-rating").textContent = "— " + item.rating;
    document.getElementById("details-date-text").textContent = new Date(item.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    document.getElementById("details-feedback").textContent = item.feedback;

    // Status badge
    const statusEl = document.getElementById("details-status");
    statusEl.textContent = item.status;
    statusEl.className = "badge large " + (item.status === "Passed" ? "badge-passed" : "badge-rejected");

    // Strengths
    const strengthsList = document.getElementById("details-strengths");
    strengthsList.innerHTML = "";
    item.strengths.forEach(s => {
        const li = document.createElement("li");
        li.textContent = s;
        strengthsList.appendChild(li);
    });

    // Weaknesses
    const weaknessesList = document.getElementById("details-weaknesses");
    weaknessesList.innerHTML = "";
    item.weaknesses.forEach(w => {
        const li = document.createElement("li");
        li.textContent = w;
        weaknessesList.appendChild(li);
    });
}

// Arrow buttons for timeline
function setupArrows() {
    document.getElementById("slide-left-btn").addEventListener("click", () => {
        document.getElementById("timeline-scroll-container").scrollLeft -= 320;
    });
    document.getElementById("slide-right-btn").addEventListener("click", () => {
        document.getElementById("timeline-scroll-container").scrollLeft += 320;
    });
}

// Drag to scroll timeline
function setupDragScroll() {
    const slider = document.getElementById("timeline-scroll-container");
    let isDown = false;
    let startX, scrollLeft;

    slider.addEventListener("mousedown", (e) => {
        isDown = true;
        startX = e.pageX - slider.offsetLeft;
        scrollLeft = slider.scrollLeft;
    });
    slider.addEventListener("mouseleave", () => isDown = false);
    slider.addEventListener("mouseup", () => isDown = false);
    slider.addEventListener("mousemove", (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - slider.offsetLeft;
        slider.scrollLeft = scrollLeft - (x - startX) * 1.5;
    });
}

// Modal open/close
function setupModal() {
    document.getElementById("view-chat-btn").addEventListener("click", () => {
        if (selectedId) openModal(selectedId);
    });
    document.getElementById("close-modal-btn").addEventListener("click", closeModal);
    document.getElementById("close-modal-footer-btn").addEventListener("click", closeModal);
    document.getElementById("chat-modal").addEventListener("click", (e) => {
        if (e.target === document.getElementById("chat-modal")) closeModal();
    });
}

function openModal(id) {
    const item = interviewsData.find(d => d.id === id);
    if (!item) return;

    document.getElementById("modal-company-logo").textContent = item.role.charAt(0);
    document.getElementById("modal-title").textContent = item.role + " Transcript";
    document.getElementById("modal-subtitle").textContent = item.difficulty + " • " + new Date(item.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

    // Render chat messages
    const container = document.getElementById("chat-messages-container");
    container.innerHTML = "";

    item.conversation.forEach(msg => {
        const isUser = msg.speaker === "User";
        const wrapper = document.createElement("div");
        wrapper.className = "chat-bubble-wrapper " + (isUser ? "candidate" : "interviewer");

        const meta = document.createElement("div");
        meta.className = "chat-meta";
        meta.innerHTML = `<span class="chat-speaker-name">${isUser ? candidateProfile.name : "AI Interviewer"}</span><span class="chat-time">${msg.time}</span>`;

        const bubble = document.createElement("div");
        bubble.className = "chat-bubble";
        bubble.textContent = msg.text;

        wrapper.appendChild(meta);
        wrapper.appendChild(bubble);
        container.appendChild(wrapper);
    });

    document.getElementById("chat-modal").classList.remove("hidden");
    document.body.style.overflow = "hidden";
}

function closeModal() {
    document.getElementById("chat-modal").classList.add("hidden");
    document.body.style.overflow = "";
}