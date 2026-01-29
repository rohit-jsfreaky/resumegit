import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { GitHubData, ResumeBullet, GenerateMode } from '../types/index.js';

export class GeminiService {
  private genAI: GoogleGenerativeAI;
  private modelName = 'gemini-2.5-flash';

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async generateBullets(data: GitHubData, mode: GenerateMode): Promise<ResumeBullet[]> {
    const model = this.genAI.getGenerativeModel({ 
      model: this.modelName,
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
      ],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 8192,
        topP: 0.8,
        topK: 40,
      },
    });

    const prompt = this.buildPrompt(data, mode);
    
    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      return this.parseResponse(text);
    } catch (error: any) {
      console.error('Gemini generation error:', error);
      throw new Error(`Failed to generate resume bullets: ${error.message}`);
    }
  }

  private buildPrompt(data: GitHubData, mode: GenerateMode): string {
    const modeInstructions = this.getModeInstructions(mode);
    
    // Prepare commit messages for the prompt
    const commitMessages = data.repos
      .flatMap(repo => repo.commits.map(c => ({
        repo: repo.name,
        message: c.message,
        additions: c.additions,
        deletions: c.deletions,
        filesChanged: c.files_changed
      })))
      .slice(0, 30);

    // Prepare repo summaries
    const repoSummaries = data.repos.map(repo => ({
      name: repo.name,
      description: repo.description,
      language: repo.language,
      stars: repo.stars,
      topics: repo.topics.slice(0, 5),
      commitCount: repo.commits.length
    }));

    return `You are an elite technical resume writer and former FAANG engineering manager. Convert the following GitHub activity data into compelling, ATS-optimized resume bullet points.

${modeInstructions}

RULES:
1. Translate technical jargon into business impact (e.g., "refactored Redux" → "Streamlined state management to improve application performance")
2. Infer metrics when reasonable (small commits = maintenance, large additions = feature work, frequent commits = high velocity)
3. Use strong action verbs: Architected, Engineered, Optimized, Implemented, Spearheaded, Developed, Designed, Led
4. Group related commits into single accomplishments (don't list every commit separately)
5. Identify tech stack from the data and mention key technologies naturally
6. Format: "[Strong Verb] [Technical Action] resulting in [Business Outcome/Metric]"
7. Avoid: "Worked on", "Helped with", "Responsible for" (weak verbs)
8. Maximum 2 lines per bullet point
9. Be specific and quantifiable where possible

INPUT DATA:
Username: ${data.username}
Profile: ${data.profile.name || data.username} - ${data.profile.bio || 'Developer'}
Total Commits (last 90 days): ${data.totalCommits}
Top Languages: ${data.topLanguages.join(', ')}
Tech Stack: ${data.techStack.join(', ')}
Average Additions per Commit: ${data.commitActivity.avgAdditions}
Average Deletions per Commit: ${data.commitActivity.avgDeletions}

Top Repositories:
${JSON.stringify(repoSummaries, null, 2)}

Recent Commit Messages:
${JSON.stringify(commitMessages, null, 2)}

OUTPUT INSTRUCTIONS:
Provide exactly 8 bullet points distributed as follows:
- 2x Technical Architecture/Optimization bullets
- 2x Feature Development/Delivery bullets
- 2x Code Quality/Collaboration bullets
- 2x Modern Tech Stack/Tooling bullets

Assign a confidence level to each bullet:
- "high" = directly supported by commit data
- "medium" = reasonably inferred from patterns
- "low" = educated guess based on context

Return ONLY a valid JSON array with no additional text, formatted exactly like this:
[
  {
    "text": "Your bullet point text here",
    "category": "Architecture",
    "tech": ["React", "Node.js"],
    "confidence": "high"
  }
]

The categories must be exactly one of: "Architecture", "Feature", "Quality", "Tooling"
Do not include any markdown formatting or code blocks in your response.`;
  }

  private getModeInstructions(mode: GenerateMode): string {
    switch (mode) {
      case 'technical':
        return `MODE: Technical Lead
Focus on: Architecture decisions, code review leadership, technical mentoring, system design, performance optimization, scalability considerations, and technical debt reduction.`;
      
      case 'impact':
        return `MODE: Impact-Focused
Focus on: Business metrics, user impact, team productivity improvements, cost savings, performance improvements with specific percentages, launch milestones, and customer-facing improvements.`;
      
      case 'entry':
        return `MODE: Entry Level
Focus on: Learning agility, collaboration with team members, exposure to modern tech stacks, project contributions, code quality practices, and proactive communication.`;
      
      default:
        return `MODE: Standard
Focus on: Balanced mix of technical depth and business impact. Professional tone suitable for mid-level engineering roles.`;
    }
  }

  private parseResponse(text: string): ResumeBullet[] {
    try {
      // Clean the response - remove markdown code blocks if present
      let cleaned = text.trim();
      if (cleaned.startsWith('```json')) {
        cleaned = cleaned.slice(7);
      } else if (cleaned.startsWith('```')) {
        cleaned = cleaned.slice(3);
      }
      if (cleaned.endsWith('```')) {
        cleaned = cleaned.slice(0, -3);
      }
      cleaned = cleaned.trim();

      const parsed = JSON.parse(cleaned);
      
      if (!Array.isArray(parsed)) {
        throw new Error('Response is not an array');
      }

      // Validate and sanitize each bullet
      return parsed.map((item, index) => ({
        id: `bullet-${Date.now()}-${index}`,
        text: String(item.text || '').trim(),
        category: this.validateCategory(item.category),
        tech: Array.isArray(item.tech) ? item.tech.map(String) : [],
        confidence: this.validateConfidence(item.confidence)
      })).filter(bullet => bullet.text.length > 0);
    } catch (error) {
      console.error('Failed to parse Gemini response:', error);
      console.error('Raw response:', text);
      
      // Fallback: try to extract bullet points from raw text
      return this.extractBulletsFromText(text);
    }
  }

  private validateCategory(category: string): ResumeBullet['category'] {
    const valid: ResumeBullet['category'][] = ['Architecture', 'Feature', 'Quality', 'Tooling'];
    return valid.includes(category as any) ? category as ResumeBullet['category'] : 'Feature';
  }

  private validateConfidence(confidence: string): ResumeBullet['confidence'] {
    const valid: ResumeBullet['confidence'][] = ['low', 'medium', 'high'];
    return valid.includes(confidence as any) ? confidence as ResumeBullet['confidence'] : 'medium';
  }

  private extractBulletsFromText(text: string): ResumeBullet[] {
    // Fallback parser for when JSON parsing fails
    const lines = text.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 20 && !line.startsWith('{') && !line.startsWith('['));
    
    return lines.slice(0, 8).map((line, index) => ({
      id: `bullet-${Date.now()}-${index}`,
      text: line.replace(/^[-•*]\s*/, '').replace(/^"\s*/, '').replace(/"\s*$/, ''),
      category: 'Feature' as const,
      tech: [],
      confidence: 'medium' as const
    }));
  }
}
