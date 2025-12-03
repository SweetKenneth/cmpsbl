import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Generate a simple math challenge
    const num1 = Math.floor(Math.random() * 20) + 1;
    const num2 = Math.floor(Math.random() * 20) + 1;
    const operators = ['+', '-', '*'];
    const operator = operators[Math.floor(Math.random() * operators.length)];

    let correctAnswer: string;
    switch (operator) {
      case '+':
        correctAnswer = (num1 + num2).toString();
        break;
      case '-':
        correctAnswer = (num1 - num2).toString();
        break;
      case '*':
        correctAnswer = (num1 * num2).toString();
        break;
      default:
        correctAnswer = '0';
    }

    const challenge = `${num1} ${operator} ${num2} = ?`;
    const token = crypto.randomUUID();

    // Store challenge in database
    await supabase.from('captcha_challenges').insert({
      token,
      challenge_text: challenge,
      correct_answer: correctAnswer,
      status: 'pending',
      created_at: new Date().toISOString(),
    });

    console.log('CAPTCHA challenge generated');

    return new Response(JSON.stringify({
      token,
      challenge,
      expires_in: 300, // 5 minutes
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error generating CAPTCHA:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
