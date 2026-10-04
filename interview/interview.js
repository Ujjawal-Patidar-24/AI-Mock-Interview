const token = localStorage.getItem("token");
if (!token) {
    window.location.href = "../login.html";
}

// Interview State
let selectedRole = null;
let selectedDifficulty = null;
let timerInterval = null;
let timeLeft = 720; // 12 minutes in seconds
let isRecording = false;
let currentAnswer = "";
let conversationHistory = [];
let recognition = null;

// DOM Ready
document.addEventListener("DOMContentLoaded", () => {
    setupRoleSelection();
    setupDifficultySelection();
    setupStartBtn();
    setupMicBtn();
    setupSubmitBtn();
    setupEndBtn();
    setupSpeechRecognition();
});

// ── SETUP SCREEN ──

// Role selection
function setupRoleSelection() {
    const btns = document.querySelectorAll("#role-options .option-btn");
    btns.forEach(btn => {
        btn.addEventListener("click", () => {
            btns.forEach(b => b.classList.remove("selected"));
            btn.classList.add("selected");
            selectedRole = btn.dataset.value;
            checkStartBtn();
        });
    });
}

// Difficulty selection
function setupDifficultySelection() {
    const btns = document.querySelectorAll("#difficulty-options .option-btn");
    btns.forEach(btn => {
        btn.addEventListener("click", () => {
            btns.forEach(b => b.classList.remove("selected"));
            btn.classList.add("selected");
            selectedDifficulty = btn.dataset.value;
            checkStartBtn();
        });
    });
}

// Enable start button only when both selected
function checkStartBtn() {
    const startBtn = document.getElementById("start-btn");
    if (selectedRole && selectedDifficulty) {
        startBtn.disabled = false;
    }
}

// Start interview
function setupStartBtn() {
    document.getElementById("start-btn").addEventListener("click", () => {
        document.getElementById("setup-screen").classList.add("hidden");
        document.getElementById("interview-screen").classList.remove("hidden");
        document.getElementById("display-role").textContent = selectedRole;
        document.getElementById("display-difficulty").textContent = selectedDifficulty;
        startTimer();
        getFirstQuestion();
    });
}

// ── TIMER ──

function startTimer() {
    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            endInterview();
        }
        // Warning when 2 minutes left
        if (timeLeft <= 120) {
            document.getElementById("timer").classList.add("warning");
        }
    }, 1000);
}

function updateTimerDisplay() {
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    document.getElementById("timer").textContent =
        String(mins).padStart(2, "0") + ":" + String(secs).padStart(2, "0");
}

// ── SPEECH RECOGNITION ──

function setupSpeechRecognition() {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
        document.getElementById("mic-btn").textContent = "🎙️ Mic Not Supported";
        document.getElementById("mic-btn").disabled = true;
        return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
        console.log("Speech recognition result:", event);
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
        }
        currentAnswer = transcript;
        const answerText = document.getElementById("answer-text");
        answerText.textContent = transcript;
        answerText.classList.add("has-answer");
    };

    recognition.onend = () => {
    isRecording = false;
    const micBtn = document.getElementById("mic-btn");
    micBtn.classList.remove("recording");
    micBtn.textContent = "🎙️ Click to Speak";
    if (currentAnswer.trim() !== "") {
        document.getElementById("submit-btn").disabled = false;
        }
    };

    recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        isRecording = false;
        document.getElementById("mic-btn").classList.remove("recording");
        document.getElementById("mic-btn").textContent = "🎙️ Click to Speak";
    };
}

// Mic button
function setupMicBtn() {
    const micBtn = document.getElementById("mic-btn");

    micBtn.addEventListener("click", () => {
        if (!recognition) return;

        if (!isRecording) {
            // Start recording
            isRecording = true;
            currentAnswer = "";
            document.getElementById("answer-text").textContent = "Listening...";
            document.getElementById("answer-text").classList.remove("has-answer");
            document.getElementById("submit-btn").disabled = true;
            micBtn.classList.add("recording");
            micBtn.textContent = "🔴 Click to Stop";
            recognition.start();
            console.log("Speech recognition started");
        } else {
            // Stop recording
            recognition.stop();
            console.log("Speech recognition stopped");
        }
    });
}

// Submit button
function setupSubmitBtn() {
    document.getElementById("submit-btn").addEventListener("click", () => {
        if (currentAnswer.trim() === "") return;
        submitAnswer(currentAnswer);
    });
}

// End button
function setupEndBtn() {
    document.getElementById("end-btn").addEventListener("click", () => {
        if (confirm("Are you sure you want to end the interview?")) {
            clearInterval(timerInterval);
            endInterview();
        }
    });
}

// ── AI INTEGRATION ──

// Get first question from Claude API
async function getFirstQuestion() {
    document.getElementById("question-text").textContent = "Generating your first question...";

    // Wait 2 seconds before calling API
    await new Promise(resolve => setTimeout(resolve, 2000));

    const systemPrompt = `You are a professional interviewer conducting a ${selectedDifficulty} level ${selectedRole} interview. 
    Ask one question at a time. 
    Start with an introductory question.
    Keep questions clear and concise.
    Do not add any extra text — just the question itself.`;

    const question = await callClaudeAPI(systemPrompt, "Start the interview with your first question.");

    document.getElementById("question-text").textContent = question;
    speakText(question);
    conversationHistory.push({ role: "assistant", content: question });
}

// Submit answer and get next question
async function submitAnswer(answer) {
    // Disable controls while AI thinks
    document.getElementById("submit-btn").disabled = true;
    document.getElementById("mic-btn").disabled = true;
    document.getElementById("question-text").textContent = "AI is thinking...";
    document.getElementById("answer-text").textContent = "Your answer will appear here after speaking...";
    document.getElementById("answer-text").classList.remove("has-answer");
    currentAnswer = "";

    // Add user answer to history
    conversationHistory.push({ role: "user", content: answer });

    const systemPrompt = `You are a professional interviewer conducting a ${selectedDifficulty} level ${selectedRole} interview.
    You have been interviewing the candidate. Based on their answer, decide:
    - If the answer is good and complete — ask the next relevant interview question
    - If the answer is vague or incomplete — ask a follow up question to dig deeper
    - Keep questions clear and concise
    - Do not evaluate or give feedback during the interview
    - Just ask the next question or follow up
    - Do not add any extra text — just the question itself
    - Always respond in English.
    - Do not repeat previous questions or answers.
    - do not ask tell user to write or type any code or text assuming this is a spoken interview.`;

    const nextQuestion = await callClaudeAPI(systemPrompt, "Based on the conversation so far, ask your next question or follow up.");

    document.getElementById("question-text").textContent = nextQuestion;
    speakText(nextQuestion);
    conversationHistory.push({ role: "assistant", content: nextQuestion });

    // Re-enable controls
    document.getElementById("mic-btn").disabled = false;
}
// AI Bolegaaaaaa
function speakText(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-IN";
    utterance.rate = 1;
    speechSynthesis.speak(utterance);
}

// Call Claude API
async function callClaudeAPI(systemPrompt, userMessage) {
    try {
        const token = localStorage.getItem("token");

        const response = await fetch("http://localhost:5000/api/ai/ask", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            },
            body: JSON.stringify({
                systemPrompt: systemPrompt,
                conversationHistory: conversationHistory,
                userMessage: userMessage
            })
        });

        const data = await response.json();
        return data.text;

    } catch (error) {
        console.error("API Error:", error);
        return "Sorry, there was an error. Please try again.";
    }
}

// End interview 
async function endInterview() {
    clearInterval(timerInterval);

    // Evaluate interview
    const evaluation = await evaluateInterview();

    // Save to database
    const interviewData = {
        role: selectedRole,
        difficulty: selectedDifficulty,
        score: evaluation.score,
        rating: evaluation.rating,
        status: evaluation.status,
        feedback: evaluation.feedback,
        strengths: evaluation.strengths,
        weaknesses: evaluation.weaknesses,
        conversation: conversationHistory.map(msg => ({
            speaker: msg.role === "assistant" ? "AI" : "User",
            text: msg.content,
            time: new Date().toLocaleTimeString()
        })),
        duration: 720 - timeLeft
    };

    try {
        const response = await fetch("http://localhost:5000/api/interview/save", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem("token")
            },
            body: JSON.stringify(interviewData)
        });

        const data = await response.json();
        console.log("Interview saved:", data);

        // Save evaluation to localStorage for results page
        localStorage.setItem("lastEvaluation", JSON.stringify(evaluation));
        localStorage.setItem("lastInterviewData", JSON.stringify(interviewData));

    } catch (error) {
        console.error("Save error:", error);
    }

    // Redirect to results page
    window.location.href = "results.html";
}


//Evaluate the interview 
async function evaluateInterview() {
    document.getElementById("question-text").textContent = "Evaluating your interview... Please wait!";
    speechSynthesis.cancel(); // Stop any ongoing speech

    const conversationText = conversationHistory.map((msg, i) => 
        `${msg.role === "assistant" ? "Interviewer" : "Candidate"}: ${msg.content}`
    ).join("\n");

    const evaluationPrompt = `You are an expert interview evaluator. 
    
Here is a complete ${selectedDifficulty} level ${selectedRole} interview conversation:

${conversationText}

Evaluate this interview and respond ONLY in this exact JSON format, nothing else:
{
    "score": (number between 0-100),
    "rating": (one of: "Excellent", "Good", "Average", "Poor"),
    "status": (one of: "Passed", "Failed"),
    "feedback": (2-3 sentences of general feedback),
    "strengths": ["strength 1", "strength 2", "strength 3"],
    "weaknesses": ["weakness 1", "weakness 2"]
}`;

    try {
        const response = await fetch("http://localhost:5000/api/ai/ask", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem("token")
            },
            body: JSON.stringify({
                systemPrompt: "You are an expert interview evaluator. Always respond in valid JSON only.",
                conversationHistory: [],
                userMessage: evaluationPrompt
            })
        });

        const data = await response.json();
        
        // Clean the response — remove markdown code blocks if any
        const cleanText = data.text.replace(/```json|```/g, "").trim();
        const evaluation = JSON.parse(cleanText);

        return evaluation;

    } catch (error) {
        console.error("Evaluation error:", error);
        return {
            score: 50,
            rating: "Average",
            status: "Passed",
            feedback: "Interview completed successfully.",
            strengths: ["Completed the interview"],
            weaknesses: ["Could not evaluate properly"]
        };
    }
}