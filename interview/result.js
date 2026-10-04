
const evaluation = JSON.parse(localStorage.getItem("lastEvaluation"));
const interviewData = JSON.parse(localStorage.getItem("lastInterviewData"));

if (!evaluation || !interviewData) {
    document.querySelector('.result-header h1').textContent = "No Results Found";
    document.querySelector('.result-header p').textContent = "Please complete an interview first";
} else {
    
    document.getElementById("roleText").textContent = interviewData.role + " • " + interviewData.difficulty;
    document.getElementById("role").textContent = interviewData.role;
    document.getElementById("difficulty").textContent = interviewData.difficulty;

    
    document.getElementById("date").textContent = new Date().toLocaleDateString("en-US", {
        year: "numeric", month: "long", day: "numeric"
    });

    
    const score = evaluation.score;
    let currentScore = 0;
    const scoreEl = document.getElementById("score");
    const interval = setInterval(() => {
        currentScore++;
        scoreEl.textContent = currentScore;
        if (currentScore >= score) clearInterval(interval);
    }, 20);

    
    const circle = document.querySelector(".progress-circle");
    const circumference = 565;
    const offset = circumference - (score / 100) * circumference;
    setTimeout(() => {
        circle.style.strokeDashoffset = offset;
    }, 100);

    
    const statusEl = document.getElementById("status");
    if (evaluation.status === "Passed") {
        statusEl.textContent = "PASSED ✅";
        statusEl.parentElement.querySelector("span").style.background = "#0d2e1a";
        statusEl.parentElement.querySelector("span").style.color = "#4ade80";
        statusEl.parentElement.querySelector("span").style.border = "1px solid #4ade80";
    } else {
        statusEl.textContent = "FAILED ❌";
        statusEl.parentElement.querySelector("span").style.background = "#2e0d0d";
        statusEl.parentElement.querySelector("span").style.color = "#f87171";
        statusEl.parentElement.querySelector("span").style.border = "1px solid #f87171";
    }

    
    document.getElementById("feedback").textContent = evaluation.feedback;

    
    const strengthsList = document.getElementById("strengths");
    strengthsList.innerHTML = "";
    evaluation.strengths.forEach(s => {
        const li = document.createElement("li");
        li.textContent = s;
        strengthsList.appendChild(li);
    });

    
    const weaknessesList = document.getElementById("weaknesses");
    weaknessesList.innerHTML = "";
    evaluation.weaknesses.forEach(w => {
        const li = document.createElement("li");
        li.textContent = w;
        weaknessesList.appendChild(li);
    });
}