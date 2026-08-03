import express from 'express';
import path from 'path';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Endpoint: AI Quick Quiz Generator
  app.post('/api/generate-quiz', async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({
          error: 'GEMINI_API_KEY belum dikonfigurasi di server environment.',
        });
      }

      const { subjectName, subjectCode, sessionTitle, sessionNotes } = req.body;

      if (!sessionTitle) {
        return res.status(400).json({ error: 'Judul sesi belajar diperlukan.' });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const prompt = `Buatkan kuis pilihan ganda singkat (3 sampai 5 soal) dalam bahasa Indonesia untuk menguji pemahaman materi kuliah.
Mata Kuliah: ${subjectName || 'Umum'} (${subjectCode || ''})
Topik Sesi Belajar: ${sessionTitle}
Catatan/Materi Tambahan: ${sessionNotes || 'Tidak ada catatan khusus'}

Aturan pembuatan kuis:
1. Buat 3 hingga 5 soal pilihan ganda yang interaktif dan mendidik.
2. Setiap soal harus memiliki tepat 4 opsi jawaban (misalnya A, B, C, D).
3. Sertakan indeks jawaban yang benar (0 untuk opsi pertama, 1 untuk opsi kedua, 2 untuk opsi ketiga, 3 untuk opsi keempat).
4. Berikan penjelasan edukatif yang ringkas dan padat untuk setiap jawaban yang benar.`;

      // Fallback model list to handle temporary 503 high demand spikes
      const modelsToTry = ['gemini-3.6-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];
      let response = null;
      let lastError: any = null;

      for (const model of modelsToTry) {
        for (let attempt = 1; attempt <= 3; attempt++) {
          try {
            const res = await ai.models.generateContent({
              model,
              contents: prompt,
              config: {
                systemInstruction:
                  'Anda adalah dosen dan akademisi ahli yang membuat kuis latihan interaktif dan edukatif untuk mahasiswa.',
                responseMimeType: 'application/json',
                responseSchema: {
                  type: Type.OBJECT,
                  properties: {
                    quizTitle: { type: Type.STRING },
                    questions: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          id: { type: Type.INTEGER },
                          question: { type: Type.STRING },
                          options: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING },
                          },
                          correctOptionIndex: { type: Type.INTEGER },
                          explanation: { type: Type.STRING },
                        },
                        required: [
                          'id',
                          'question',
                          'options',
                          'correctOptionIndex',
                          'explanation',
                        ],
                      },
                    },
                  },
                  required: ['quizTitle', 'questions'],
                },
              },
            });
            if (res && res.text) {
              response = res;
              break;
            }
          } catch (err: any) {
            lastError = err;
            const errStr = String(err?.message || err || '');
            const isTemporary =
              errStr.includes('503') ||
              errStr.includes('429') ||
              errStr.includes('UNAVAILABLE') ||
              errStr.includes('high demand');

            if (isTemporary && attempt < 3) {
              await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
              continue;
            }
            break; // Move to next fallback model
          }
        }
        if (response) break;
      }

      if (!response) {
        throw lastError || new Error('Model Gemini sedang sibuk. Silakan coba beberapa saat lagi.');
      }

      const responseText = response.text;
      if (!responseText) {
        throw new Error('Gemini tidak mengembalikan respons teks.');
      }

      const quizData = JSON.parse(responseText);
      return res.json(quizData);
    } catch (err: any) {
      console.error('Error generating quiz with Gemini:', err);
      return res.status(500).json({
        error: err.message || 'Gagal menghasilkan kuis dengan AI.',
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
