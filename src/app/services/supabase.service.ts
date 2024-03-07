import { Injectable, NgZone, inject } from '@angular/core';
import { SupabaseClient, createClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  private supabase: SupabaseClient;
  private readonly ngZone = inject(NgZone);

  constructor() {
    this.supabase = this.ngZone.runOutsideAngular(() =>
      createClient(environment.supabaseUrl, environment.supabaseKey)
    );
  }

  async getWords() {
    return this.supabase.from('words').select();
  }

  async getWordPictures(word_id: string) {
    return this.supabase.from('pictures').select().eq('word_id', word_id);
  }
}
