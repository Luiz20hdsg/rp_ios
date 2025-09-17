import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@env';


if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Variáveis do Supabase não definidas');
}

console.log('DEBUG: Valor da SUPABASE_URL =', SUPABASE_URL);
console.log('DEBUG: Valor da SUPABASE_URL =', SUPABASE_ANON_KEY);

//const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
//added

// Create a single supabase client for interacting with your database
const supabase = createClient('https://fpyxdxuceinuvagmovsg.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZweXhkeHVjZWludXZhZ21vdnNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQwNzQ3MjgsImV4cCI6MjA1OTY1MDcyOH0.HeXThSqm2BMc7PBc56nARIGTjfGY68v9Z54IMCPJmtE')

console.log('DEBUG2: Valor da SUPABASE_URL =', SUPABASE_URL);
console.log('DEBUG: Valor da SUPABASE_URL =', SUPABASE_ANON_KEY);


export const sendAuthCode = async (email) => {
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    console.error('Email inválido:', email);
    return false;
  }
  try {
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) throw error;
    console.log('Código enviado com sucesso para:', email);
    return true;
  } catch (error) {
    console.error('Erro ao enviar código:', error.message);
    return false;
  }
};

export const verifyAuthCode = async (email, token) => {
  try {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email',
    });
    if (error) {
      const message = error.code === 'invalid_token'
        ? 'Código inválido ou expirado'
        : `Erro ao verificar código: ${error.message}`;
      throw new Error(message);
    }
    console.log('Autenticação bem-sucedida:', data);
    return data.session;
  } catch (error) {
    console.error(error.message);
    return null;
  }
};