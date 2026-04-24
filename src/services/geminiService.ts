import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function askStudyBuddy(question: string) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: question,
    config: {
      systemInstruction: "You are AI Study Buddy, a helpful and professional tutor for BTech students. Provide clear, academic, and concise answers to engineering and technical questions.",
    },
  });
  return response.text;
}

export async function generateInnovationIdeas(domain: string, resumeProfile?: any) {
  const prompt = resumeProfile 
    ? `Generate 5 innovative project ideas for the domain: ${domain}, specifically tailored for a student with this profile: ${JSON.stringify(resumeProfile)}.`
    : `Generate 5 innovative project ideas for the domain: ${domain}.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      systemInstruction: "You are an Innovation Idea Generator. Provide a list of 5 unique and practical project ideas for BTech students. Return ONLY a JSON array of strings.",
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
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Based on this resume profile: ${JSON.stringify(resumeProfile)}, generate a personalized 4-week study plan to bridge skill gaps and prepare for top-tier engineering roles.`,
    config: {
      systemInstruction: "You are a Career and Academic Mentor. Provide a detailed 4-week study plan in Markdown format. Focus on bridging the 'missingSkills' identified in the profile and strengthening 'matchedSkills'. Be encouraging and professional.",
    },
  });
  return response.text;
}

export async function generateCareerRoadmap(resumeProfile: any) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Based on this resume profile: ${JSON.stringify(resumeProfile)}, generate a detailed career roadmap for the next 12 months. Include certifications to pursue, project types to build, and networking strategies.`,
    config: {
      systemInstruction: "You are a Senior Career Strategist. Provide a structured 12-month career roadmap in Markdown format. Break it down into quarterly milestones (Q1-Q4). Focus on high-impact actions that will lead to a top-tier engineering role.",
    },
  });
  return response.text;
}

export async function analyzeResumePDF(pdfBase64: string) {
  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: [
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
    ],
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
    return null;
  }
}

export async function recommendJobs(skills: string, resumeProfile: any) {
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
    model: "gemini-3.1-pro-preview",
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
  try {
    return JSON.parse(response.text || "[]");
  } catch (e) {
    return [];
  }
}
