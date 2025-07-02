export async function getTranslations(text:string) {
            // --- Prompt Engineering ---
            // This prompt instructs the model to return a specific JSON object.
            const prompt = `Translate the following text into English, Turkish, and Vietnamese. Return the result as a single, well-formed JSON object with the keys "en", "tr", and "vi". Do not include any other text, explanation, or markdown formatting in your response. Just the raw JSON object.

Text to translate: "${text}"`;

            const chatHistory = [{ role: "user", parts: [{ text: prompt }] }];
            
            // Define the expected JSON structure for the API response.
            // This tells Gemini to return structured data, which is more reliable.
            const payload = {
                contents: chatHistory,
                generationConfig: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: "OBJECT",
                        properties: {
                            "en": { "type": "STRING", "description": "English translation" },
                            "tr": { "type": "STRING", "description": "Turkish translation" },
                            "vi": { "type": "STRING", "description": "Vietnamese translation" }
                        },
                        required: ["en", "tr", "vi"]
                    }
                }
            };
            
            const apiKey =  "AIzaSyBZRLmxNap3BE9r-b8gVQV8dn3y0fF5M6c"; // Leave empty, will be handled by the environment
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorBody = await response.text();
                throw new Error(`API request failed with status ${response.status}: ${errorBody}`);
            }

            const result = await response.json();
            
            if (result.candidates && result.candidates[0].content && result.candidates[0].content.parts[0].text) {
                // The response from the structured API call is a JSON string that needs to be parsed.
                return JSON.parse(result.candidates[0].content.parts[0].text);
            } else {
                console.error("Unexpected API response structure:", result);
                return null;
            }
        }