/**
 * BRAIN Neural Substrate Layer — Confidence Classifier
 * Lightweight logistic regression for go/no-go gating
 * 
 * Predicts success probability for proposed actions.
 * NEXUS router consults this before autonomous execution.
 */

import { supabase } from '@/integrations/supabase/client';
import { embeddingEngine, EMBEDDING_DIM } from './embedding-engine';

export type ConfidenceRecommendation = 'proceed' | 'cautious' | 'escalate';

export interface ConfidencePrediction {
  confidence: number;
  recommendation: ConfidenceRecommendation;
  features_used: number;
}

interface ClassifierState {
  initialized: boolean;
  hasModel: boolean;
  trainingSamples: number;
  accuracy: number;
  eceScore: number;
  lastTrainedAt: string | null;
  error: string | null;
}

const ACTIVATION_THRESHOLD = 200; // min labeled traces
const PROCEED_THRESHOLD = 0.85;
const CAUTIOUS_THRESHOLD = 0.60;

/**
 * Lightweight confidence classifier
 * Uses logistic regression with embedding features + context signals
 */
class ConfidenceClassifier {
  private weights: Float32Array | null = null;
  private bias: number = 0;
  private state: ClassifierState = {
    initialized: false,
    hasModel: false,
    trainingSamples: 0,
    accuracy: 0,
    eceScore: 0,
    lastTrainedAt: null,
    error: null,
  };

  /**
   * Initialize — load active model from database
   */
  async initialize(): Promise<boolean> {
    if (this.state.initialized) return this.state.hasModel;

    try {
      const { data } = await supabase
        .from('brain_classifier_models')
        .select('*')
        .eq('model_type', 'confidence')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data?.weights) {
        const w = data.weights as any;
        if (w.weights && Array.isArray(w.weights)) {
          this.weights = new Float32Array(w.weights);
          this.bias = w.bias ?? 0;
          this.state.hasModel = true;
          this.state.trainingSamples = data.training_samples;
          this.state.accuracy = Number(data.accuracy);
          this.state.eceScore = Number(data.ece_score);
          this.state.lastTrainedAt = data.created_at;
        }
      }

      this.state.initialized = true;
      return this.state.hasModel;
    } catch {
      this.state.initialized = true;
      return false;
    }
  }

  /**
   * Predict success probability for a given action
   */
  predict(text: string, contextFeatures?: Record<string, number>): ConfidencePrediction {
    if (!this.state.hasModel || !this.weights) {
      // No model available — return neutral prediction
      return {
        confidence: 0.5,
        recommendation: 'cautious',
        features_used: 0,
      };
    }

    const embedding = embeddingEngine.encode(text);

    // Logistic regression: sigmoid(w · x + b)
    let logit = this.bias;
    const featureCount = Math.min(this.weights.length, embedding.length);
    for (let i = 0; i < featureCount; i++) {
      logit += this.weights[i] * embedding[i];
    }

    // Add context features if available
    if (contextFeatures) {
      const contextKeys = ['mastery_score', 'historical_success_rate', 'module_health'];
      contextKeys.forEach((key, idx) => {
        const featureIdx = EMBEDDING_DIM + idx;
        if (contextFeatures[key] !== undefined && featureIdx < this.weights!.length) {
          logit += this.weights![featureIdx] * contextFeatures[key];
        }
      });
    }

    // Sigmoid
    const confidence = 1 / (1 + Math.exp(-logit));

    // Classify recommendation
    let recommendation: ConfidenceRecommendation;
    if (confidence >= PROCEED_THRESHOLD) {
      recommendation = 'proceed';
    } else if (confidence >= CAUTIOUS_THRESHOLD) {
      recommendation = 'cautious';
    } else {
      recommendation = 'escalate';
    }

    return {
      confidence,
      recommendation,
      features_used: featureCount + Object.keys(contextFeatures ?? {}).length,
    };
  }

  /**
   * Train model from labeled reasoning traces
   * Called by the maintenance automation — not meant for manual invocation
   */
  async train(): Promise<{ samples: number; accuracy: number } | null> {
    try {
      // Fetch traces — use pattern_confidence as success signal
      const { data: traces, error } = await supabase
        .from('brain_reasoning_traces')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(2000);

      if (error || !traces || traces.length < ACTIVATION_THRESHOLD) {
        return null;
      }

      // Simple online logistic regression training
      const weights = new Float32Array(EMBEDDING_DIM + 3).fill(0);
      let bias = 0;
      const lr = 0.01;
      let correct = 0;

      for (const trace of traces) {
        const content = typeof trace.prompt === 'string' ? trace.prompt : JSON.stringify(trace.prompt);
        const embedding = embeddingEngine.encode(content);
        // Use pattern_confidence as label proxy (>0.7 = success)
        const label = (trace.pattern_confidence ?? 0) > 0.7 ? 1 : 0;

        // Forward pass
        let logit = bias;
        for (let i = 0; i < EMBEDDING_DIM; i++) {
          logit += weights[i] * embedding[i];
        }
        const pred = 1 / (1 + Math.exp(-logit));

        // Track accuracy
        if ((pred >= 0.5 && label === 1) || (pred < 0.5 && label === 0)) {
          correct++;
        }

        // Backward pass (gradient descent)
        const error_signal = pred - label;
        bias -= lr * error_signal;
        for (let i = 0; i < EMBEDDING_DIM; i++) {
          weights[i] -= lr * error_signal * embedding[i];
        }
      }

      const accuracy = correct / traces.length;

      // Store model — insert first, then deactivate old ones on success
      const { data: newModel, error: insertError } = await supabase
        .from('brain_classifier_models')
        .insert({
          model_type: 'confidence',
          weights: { weights: Array.from(weights), bias },
          training_metadata: {
            samples: traces.length,
            accuracy,
            trained_at: new Date().toISOString(),
          },
          training_samples: traces.length,
          accuracy,
          is_active: true,
        })
        .select('id')
        .single();

      // Only deactivate old models if the new one inserted successfully
      if (!insertError && newModel) {
        await supabase
          .from('brain_classifier_models')
          .update({ is_active: false })
          .eq('model_type', 'confidence')
          .eq('is_active', true)
          .neq('id', newModel.id);
      }

      // Update local state
      this.weights = weights;
      this.bias = bias;
      this.state.hasModel = true;
      this.state.trainingSamples = traces.length;
      this.state.accuracy = accuracy;
      this.state.lastTrainedAt = new Date().toISOString();

      return { samples: traces.length, accuracy };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown training error';
      console.warn('[Neural] Classifier training error:', message);
      this.state.error = message;
      return null;
    }
  }

  getState(): ClassifierState {
    return { ...this.state };
  }
}

export const confidenceClassifier = new ConfidenceClassifier();
export type { ClassifierState };
export { ACTIVATION_THRESHOLD as CLASSIFIER_ACTIVATION_THRESHOLD };
