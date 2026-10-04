import fetch from 'node-fetch';

export const getAIResponse = async (req, res) => {
    try {
        const { systemPrompt, conversationHistory, userMessage } = req.body;

        const messages = [
            { role: "system", content: systemPrompt },
            ...conversationHistory,
            { role: "user", content: userMessage }
        ];

        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + process.env.GROQ_API_KEY
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: messages,
                max_tokens: 500
            })
        });

        const data = await response.json();
        const aiText = data.choices[0].message.content;

        res.status(200).json({ text: aiText });

    } catch (error) {
        console.error("AI Error:", error);
        res.status(500).json({ message: "AI request failed", error: error.message });
    }
};