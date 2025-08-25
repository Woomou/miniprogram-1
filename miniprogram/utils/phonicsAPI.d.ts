/**
 * TypeScript type definitions for Phonics API
 */

export interface PhonemeData {
  grapheme: string;
  phoneme: string;
  alternatives?: string[];
  type: 'single' | 'digraph' | 'trigraph';
  description?: string;
}

export interface SyllablesResponse {
  word: string;
  pyphen_syllables: string[];
  basic_syllables: string[];
  pyphen_count: number;
  basic_count: number;
  estimated_syllable_count: number;
}

export interface PhonemesResponse {
  word: string;
  basic_phonemes: PhonemeData[];
  advanced_phonemes: string[];
  phoneme_count_basic: number;
  phoneme_count_advanced: number;
}

export interface AudioResponse {
  word: string;
  audio_base64: string;
  audio_format: string;
}

export interface SplitResponse {
  word: string;
  word_length: number;
  splits: {
    syllable_pyphen?: string[];
    syllable_basic?: string[];
    phoneme_basic?: PhonemeData[];
    phoneme_advanced?: string[];
    syllable_pyphen_audio?: {
      full_word: string;
      parts: Record<string, string>;
    };
  };
}

export interface AnalysisResponse {
  word: string;
  word_length: number;
  splits: {
    syllable_pyphen?: string[];
    syllable_basic?: string[];
    phoneme_basic?: PhonemeData[];
    phoneme_advanced?: string[];
  };
  analysis: {
    word_length: number;
    letter_count: number;
    vowel_count: number;
    consonant_count: number;
    has_digraphs: boolean;
    has_compound_parts?: boolean;
  };
  compound_parts?: string[];
  audio?: {
    format: string;
    data: string;
  };
}

export interface HealthResponse {
  status: string;
  service: string;
  available_features: {
    pyphen: boolean;
    phonemizer: boolean;
    gtts: boolean;
    syllables: boolean;
  };
}

export interface SplitOptions {
  splitTypes?: string[];
  generateAudio?: boolean;
  audioType?: 'combined' | 'individual' | 'both';
}

export interface PhonicsAPIClient {
  splitWord(word: string, options?: SplitOptions): Promise<SplitResponse>;
  getSyllables(word: string): Promise<SyllablesResponse>;
  getPhonemes(word: string): Promise<PhonemesResponse>;
  getAudio(word: string): Promise<AudioResponse>;
  analyzeWord(word: string, includeAudio?: boolean): Promise<AnalysisResponse>;
  checkHealth(): Promise<HealthResponse>;
  playAudioFromBase64(audioBase64: string, format?: string): any;
  callWithRetry<T>(apiCall: () => Promise<T>, maxRetries?: number, delay?: number): Promise<T>;
}

export declare const phonicsAPI: PhonicsAPIClient;