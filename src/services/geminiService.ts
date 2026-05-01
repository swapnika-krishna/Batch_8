import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function askStudyBuddy(question: string, history: { role: 'user' | 'model', parts: { text: string }[] }[] = []) {
  try {
    const chat = ai.chats.create({
      model: "gemini-3.1-pro-preview",
      history: history,
      config: {
        systemInstruction: "You are AI Study Buddy, a helpful and professional tutor for BTech students. Provide clear, academic, and concise answers to engineering and technical questions. Use Markdown for formatting.",
      },
    });
    const response = await chat.sendMessage({ message: question });
    return response.text;
  } catch (error) {
    console.error("Error in askStudyBuddy:", error);
    throw error;
  }
}

export async function generateInnovationIdeas(domain: string, resumeProfile?: any) {
  const prompt = resumeProfile 
    ? `Generate 30 innovative and unique project ideas for the domain: ${domain}, specifically tailored for a student with this profile: ${JSON.stringify(resumeProfile)}. 
       Ensure the ideas range from beginner to advanced levels. Each idea should be a concise, one-sentence description.`
    : `Generate 30 innovative and unique project ideas for the domain: ${domain}. 
       Ensure the ideas range from beginner to advanced levels. Each idea should be a concise, one-sentence description.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      systemInstruction: "You are an Innovation Idea Generator. Provide an exhaustive list of 30 unique, creative, and practical project ideas for BTech students. Return ONLY a JSON array of strings containing the ideas.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
      }
    },
  });
  try {
    return JSON.parse(response.text || "[]") as string[];
  } catch (e) {
    return [];
  }
}

export async function generateStudyPlan(resumeProfile: any) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: { 
        parts: [{ 
          text: `Based on this resume profile: ${JSON.stringify(resumeProfile)}, generate a personalized 4-week study plan to bridge skill gaps and prepare for top-tier engineering roles.` 
        }] 
      },
      config: {
        systemInstruction: "You are a Career and Academic Mentor. Provide a detailed 4-week study plan in Markdown format. Focus on bridging the 'missingSkills' identified in the profile and strengthening 'matchedSkills'. Be encouraging and professional.",
      },
    });
    return response.text;
  } catch (error) {
    console.error("Error in generateStudyPlan:", error);
    return null;
  }
}

export async function generateCareerRoadmap(resumeProfile: any) {
  const prompt = `Based on this resume profile: ${JSON.stringify(resumeProfile)}, generate a structured 12-month career roadmap.
  Divide it into 4 quarters (Q1, Q2, Q3, Q4).
  For each quarter, provide:
  - theme: A concise focus (e.g., "Foundation & Skills", "Advanced Projects").
  - activities: 3 specific, actionable goals.
  - milestone: A major achievement for that quarter.
  - icon: Choose from "Code", "Brain", "Briefcase", "Send", "Award", "Target", "Search", "Users".

  Return ONLY a JSON object with a "roadmap" array of 4 objects.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      systemInstruction: "You are a Career Architect. Provide a structured 12-month roadmap in JSON format. Use clear, high-impact language.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          roadmap: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                quarter: { type: Type.STRING },
                theme: { type: Type.STRING },
                activities: { type: Type.ARRAY, items: { type: Type.STRING } },
                milestone: { type: Type.STRING },
                icon: { type: Type.STRING }
              },
              required: ["quarter", "theme", "activities", "milestone", "icon"]
            }
          }
        },
        required: ["roadmap"]
      }
    },
  });
  
  try {
    const data = JSON.parse(response.text || "{}");
    return data.roadmap;
  } catch (e) {
    return [];
  }
}

export async function analyzeResumePDF(pdfBase64: string) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: "application/pdf",
            data: pdfBase64
          }
        },
        {
          text: `ULTRA-STRICT EXTRACTION PROTOCOL:
        1. Read the PDF. Locate the 'Skills', 'Tools', or 'Technologies' section.
        2. Extract ONLY the technical keywords (Languages, Frameworks, Databases, Tools).
        3. DO NOT extract every noun or verb from the experience section.
        4. DO NOT split multi-word technologies (e.g., 'Google Cloud Platform' is ONE skill, not three).
        5. DO NOT include soft skills (Leadership, Management, etc.).
        6. DO NOT include version numbers (e.g., 'Java 8' should just be 'Java').
        7. If a skill is mentioned multiple times, list it only ONCE.
        8. Target count: Usually 10-20 core technical skills for a BTech student. If you find 40+, you are being too broad.`
        }
      ]
    },
    config: {
      systemInstruction: "You are a pedantic Resume Parser. Your sole mission is to extract a CLEAN, MINIMALIST list of technical skills. You must ignore all fluff, soft skills, and common words. Accuracy is more important than quantity. Return a JSON object with: score, matchedSkills (array of strings), missingSkills (array of strings), experienceLevel, and suggestion.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          score: { type: Type.NUMBER },
          matchedSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
          missingSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
          experienceLevel: { type: Type.STRING },
          suggestion: { type: Type.STRING }
        },
        required: ["score", "matchedSkills", "missingSkills", "experienceLevel", "suggestion"]
      }
    },
  });
  try {
    return JSON.parse(response.text || "{}");
  } catch (e) {
    console.error("Error in analyzeResumePDF:", e);
    return null;
  }
}

export async function recommendJobs(skills: string, resumeProfile: any) {
  try {
    const prompt = resumeProfile 
      ? `Analyze this student's resume profile: ${JSON.stringify(resumeProfile)}. 
         The user's verified skills from their resume are: ${skills}. 
         
         STRICT REQUIREMENT: Recommend 5 job roles that match ONLY these specific skills. 
         Do not suggest roles that require skills not listed in the 'matchedSkills' or the provided 'skills' string.
         
         MATCHING LOGIC:
         1. The 'matchPercentage' (0-100) must be calculated based on how well the job requirements align with the EXACT skills found in the resume.
         2. If a job requires a skill that is in 'missingSkills', the matchPercentage MUST be significantly lower.
         3. Provide 'matchDetails' explaining which specific skills from the resume triggered this recommendation.`
      : `Recommend 5 job roles and descriptions for someone with these skills: ${skills}. Only use the provided skills for matching.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: "You are a Career Placement Specialist. Based STRICTLY on the provided resume skills, recommend 5 relevant job roles. For each role, provide a title, a brief description, 3 key companies, a 'matchPercentage' (0-100), and 'matchDetails'. Return ONLY a JSON array of objects.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              companies: { type: Type.ARRAY, items: { type: Type.STRING } },
              matchPercentage: { type: Type.NUMBER },
              matchDetails: { type: Type.STRING }
            },
            required: ["title", "description", "companies", "matchPercentage", "matchDetails"]
          }
        }
      },
    });
    return JSON.parse(response.text || "[]");
  } catch (e) {
    console.error("Error in recommendJobs:", e);
    return [];
  }
}

export async function getNearbyJobs(location: string, resumeProfile?: any) {
  try {
    const prompt = resumeProfile 
      ? `Find relevant job opportunities for a BTech student with this profile: ${JSON.stringify(resumeProfile)} in the location: ${location}. 
         Focus on local companies, tech hubs, or remote roles common in this region. 
         Recommend 6 specific job titles with local context.`
      : `Recommend 6 specific job opportunities for a tech enthusiast in: ${location}. 
         Include job titles, typical companies in that region, and estimated salary ranges.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: "You are a Local Placement Assistant. Provide 6 realistic job opportunities in the specified location. For each, include title, company, description, matchDifficulty (Beginner, Intermediate, Advanced), and locationSnippet (short local context). Return ONLY a JSON array of objects.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              company: { type: Type.STRING },
              description: { type: Type.STRING },
              matchDifficulty: { type: Type.STRING },
              locationSnippet: { type: Type.STRING }
            },
            required: ["title", "company", "description", "matchDifficulty", "locationSnippet"]
          }
        }
      },
    });
    return JSON.parse(response.text || "[]");
  } catch (e) {
    console.error("Error in getNearbyJobs:", e);
    return [];
  }
}
