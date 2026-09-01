import express, { Request, Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// ==========================================
// LAZY-INITIALIZED SERVER-SIDE CLIENTS
// ==========================================
let supabaseServerClient: SupabaseClient | null = null;

function getSupabaseServerClient(): SupabaseClient | null {
  if (supabaseServerClient) return supabaseServerClient;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
  if (url && key && url.startsWith('http')) {
    supabaseServerClient = createClient(url, key);
    return supabaseServerClient;
  }
  return null;
}

let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (geminiClient) return geminiClient;
  const key = process.env.GEMINI_API_KEY;
  if (key) {
    geminiClient = new GoogleGenAI({ apiKey: key });
    return geminiClient;
  }
  return null;
}

// ==========================================
// SERVER-SIDE API ROUTES (/api/*)
// ==========================================

// Health Check
app.get('/api/health', (_req: Request, res: Response) => {
  const isSupabaseReady = Boolean(getSupabaseServerClient());
  const isGeminiReady = Boolean(process.env.GEMINI_API_KEY);
  res.json({
    status: 'ok',
    supabaseConnected: isSupabaseReady,
    geminiConnected: isGeminiReady
  });
});

// Authentication Proxy
app.post('/api/auth/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const supabase = getSupabaseServerClient();
  
  if (!supabase) {
    return res.status(200).json({
      fallback: true,
      message: 'Server operating in local persistence mode'
    });
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: password || '123456'
    });
    if (error) return res.status(400).json({ error: error.message });

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    return res.json({ session: data.session, user: profile || data.user });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Authentication error' });
  }
});

app.post('/api/auth/signup', async (req: Request, res: Response) => {
  const { email, password, full_name } = req.body;
  const supabase = getSupabaseServerClient();
  
  if (!supabase) {
    return res.status(200).json({
      fallback: true,
      message: 'Server operating in local persistence mode'
    });
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password: password || '123456',
      options: { data: { full_name: full_name || email.split('@')[0] } }
    });
    if (error) return res.status(400).json({ error: error.message });
    return res.json({ user: data.user, session: data.session });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Registration error' });
  }
});

// Profiles API
app.get('/api/profiles/:id', async (req: Request, res: Response) => {
  const supabase = getSupabaseServerClient();
  if (!supabase) return res.status(200).json({ fallback: true });

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', req.params.id)
      .single();
    if (error) return res.status(404).json({ error: error.message });
    return res.json(data);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.put('/api/profiles/:id', async (req: Request, res: Response) => {
  const supabase = getSupabaseServerClient();
  if (!supabase) return res.status(200).json({ fallback: true });

  try {
    const payload = {
      ...req.body,
      id: req.params.id,
      updated_at: new Date().toISOString()
    };
    const { data, error } = await supabase
      .from('profiles')
      .upsert(payload)
      .select()
      .single();
    if (error) return res.status(400).json({ error: error.message });
    return res.json(data);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Food Logs API
app.get('/api/food-logs', async (req: Request, res: Response) => {
  const supabase = getSupabaseServerClient();
  if (!supabase) return res.status(200).json({ fallback: true, data: [] });

  const userId = req.query.user_id as string;
  const date = req.query.date as string;

  try {
    let query = supabase.from('food_logs').select('*').eq('user_id', userId);
    if (date) query = query.eq('log_date', date);
    const { data, error } = await query.order('created_at', { ascending: true });
    if (error) return res.status(400).json({ error: error.message });
    return res.json({ data: data || [] });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.post('/api/food-logs', async (req: Request, res: Response) => {
  const supabase = getSupabaseServerClient();
  if (!supabase) return res.status(200).json({ fallback: true });

  try {
    const { data, error } = await supabase
      .from('food_logs')
      .insert(req.body)
      .select()
      .single();
    if (error) return res.status(400).json({ error: error.message });
    return res.json(data);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.delete('/api/food-logs/:id', async (req: Request, res: Response) => {
  const supabase = getSupabaseServerClient();
  if (!supabase) return res.status(200).json({ fallback: true });

  const userId = req.query.user_id as string;
  try {
    const { error } = await supabase
      .from('food_logs')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', userId);
    if (error) return res.status(400).json({ error: error.message });
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Water Logs API
app.get('/api/water-logs', async (req: Request, res: Response) => {
  const supabase = getSupabaseServerClient();
  if (!supabase) return res.status(200).json({ fallback: true, data: [] });

  const userId = req.query.user_id as string;
  const date = req.query.date as string;

  try {
    let query = supabase.from('water_logs').select('*').eq('user_id', userId);
    if (date) query = query.eq('log_date', date);
    const { data, error } = await query;
    if (error) return res.status(400).json({ error: error.message });
    return res.json({ data: data || [] });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.post('/api/water-logs', async (req: Request, res: Response) => {
  const supabase = getSupabaseServerClient();
  if (!supabase) return res.status(200).json({ fallback: true });

  try {
    const { data, error } = await supabase
      .from('water_logs')
      .insert(req.body)
      .select()
      .single();
    if (error) return res.status(400).json({ error: error.message });
    return res.json(data);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Sleep Logs API
app.get('/api/sleep-logs', async (req: Request, res: Response) => {
  const supabase = getSupabaseServerClient();
  if (!supabase) return res.status(200).json({ fallback: true, data: [] });

  const userId = req.query.user_id as string;
  try {
    const { data, error } = await supabase
      .from('sleep_logs')
      .select('*')
      .eq('user_id', userId)
      .order('log_date', { ascending: false });
    if (error) return res.status(400).json({ error: error.message });
    return res.json({ data: data || [] });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.post('/api/sleep-logs', async (req: Request, res: Response) => {
  const supabase = getSupabaseServerClient();
  if (!supabase) return res.status(200).json({ fallback: true });

  try {
    const { data, error } = await supabase
      .from('sleep_logs')
      .upsert(req.body)
      .select()
      .single();
    if (error) return res.status(400).json({ error: error.message });
    return res.json(data);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Activity Logs API
app.get('/api/activity-logs', async (req: Request, res: Response) => {
  const supabase = getSupabaseServerClient();
  if (!supabase) return res.status(200).json({ fallback: true, data: [] });

  const userId = req.query.user_id as string;
  try {
    const { data, error } = await supabase
      .from('activity_logs')
      .select('*')
      .eq('user_id', userId)
      .order('log_date', { ascending: false });
    if (error) return res.status(400).json({ error: error.message });
    return res.json({ data: data || [] });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.post('/api/activity-logs', async (req: Request, res: Response) => {
  const supabase = getSupabaseServerClient();
  if (!supabase) return res.status(200).json({ fallback: true });

  try {
    const { data, error } = await supabase
      .from('activity_logs')
      .insert(req.body)
      .select()
      .single();
    if (error) return res.status(400).json({ error: error.message });
    return res.json(data);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Weight Logs API
app.get('/api/weight-logs', async (req: Request, res: Response) => {
  const supabase = getSupabaseServerClient();
  if (!supabase) return res.status(200).json({ fallback: true, data: [] });

  const userId = req.query.user_id as string;
  try {
    const { data, error } = await supabase
      .from('weight_logs')
      .select('*')
      .eq('user_id', userId)
      .order('log_date', { ascending: true });
    if (error) return res.status(400).json({ error: error.message });
    return res.json({ data: data || [] });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.post('/api/weight-logs', async (req: Request, res: Response) => {
  const supabase = getSupabaseServerClient();
  if (!supabase) return res.status(200).json({ fallback: true });

  try {
    const { data, error } = await supabase
      .from('weight_logs')
      .upsert(req.body)
      .select()
      .single();
    if (error) return res.status(400).json({ error: error.message });
    return res.json(data);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Diet Plans API
app.get('/api/diet-plans', async (req: Request, res: Response) => {
  const supabase = getSupabaseServerClient();
  if (!supabase) return res.status(200).json({ fallback: true, data: [] });

  const userId = req.query.user_id as string;
  try {
    const { data, error } = await supabase
      .from('diet_plans')
      .select('*')
      .eq('user_id', userId);
    if (error) return res.status(400).json({ error: error.message });
    return res.json({ data: data || [] });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.post('/api/diet-plans', async (req: Request, res: Response) => {
  const supabase = getSupabaseServerClient();
  if (!supabase) return res.status(200).json({ fallback: true });

  try {
    const { data, error } = await supabase
      .from('diet_plans')
      .upsert(req.body)
      .select()
      .single();
    if (error) return res.status(400).json({ error: error.message });
    return res.json(data);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Gemini AI Nutrition Advisor (Server-Side Proxy)
app.post('/api/ai/diet-advice', async (req: Request, res: Response) => {
  const gemini = getGeminiClient();
  if (!gemini) {
    return res.status(200).json({
      fallback: true,
      advice: 'Stay hydrated, balance your protein intake with paneer/dal/chicken, and maintain consistent step counts daily!'
    });
  }

  try {
    const { userGoal, currentCalories, targetCalories, foodLogs } = req.body;
    const prompt = `You are FitSathi, an Indian nutrition & fitness coach. 
Goal: ${userGoal || 'Fitness'}
Today's intake: ${currentCalories || 0} kcal / Target: ${targetCalories || 2200} kcal.
Meals consumed: ${JSON.stringify(foodLogs || [])}.
Provide a concise, encouraging 3-sentence actionable nutritional recommendation for the rest of the day with authentic Indian food tips.`;

    const response = await gemini.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt
    });

    return res.json({ advice: response.text });
  } catch (err: any) {
    return res.json({
      fallback: true,
      advice: 'Focus on consuming whole grains, seasonal vegetables, and getting at least 7.5 hours of restorative sleep.'
    });
  }
});

// ==========================================
// VITE SPA MIDDLEWARE / STATIC ASSETS
// ==========================================
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`FitSathi Full-Stack Server active on http://0.0.0.0:${PORT}`);
  });
}

startServer();
