import { Component, Inject, OnInit, afterNextRender } from '@angular/core';
import { SupabaseService } from '../../services/supabase.service';
import confetti from 'canvas-confetti';
import { CommonModule, DOCUMENT } from '@angular/common';

interface Letter {
  id?: number;
  value?: string;
  selectedButton?: number;
}

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss',
})
export class MainComponent implements OnInit {
  targetWordId: string | undefined | null;
  words: any[] = [];
  targetWord: any;
  pictures: any[] = [];
  loading = true;
  correctLetters: string[] = [];
  keyboardButtons: string[] = []; //Array.from({ length: 26 }, (_, i) => String.fromCharCode('A'.charCodeAt(0) + i));
  disabledButtons: number[] = [];
  tryLetters: Letter[] = [];
  success: boolean = false;

  constructor(
    private readonly supabaseService: SupabaseService,
    @Inject(DOCUMENT) private document: Document
  ) {
    const localStorage = document.defaultView?.localStorage;

    if (localStorage) {
      this.targetWordId = localStorage.getItem('target_word_id');
    }
  }

  ngOnInit(): void {
    console.log(this.targetWordId);

    this.loadWords();
  }

  async loadWords(): Promise<void> {
    try {
      const { error, data } = await this.supabaseService.getWords();
      if (error) {
        throw error;
      } else {
        console.log(data);
        this.words = data;
        if (this.targetWordId) {
          if (data.find((data: any) => data.id == this.targetWordId)) {
            this.targetWord = data.find((data: any) => data.id == this.targetWordId);
          } else {
            this.targetWord = data[0];
          }
        } else {
          this.targetWord = data[0];
        }

        this.correctLetters = this.targetWord.name.toUpperCase().split('');
        for (let i = 0; i < this.correctLetters.length; i++) {
          this.keyboardButtons.push(this.correctLetters[i]);

          let _letter: Letter = {
            id: i,
            value: '',
          };

          this.tryLetters.push(_letter);
        }
        console.log(this.tryLetters);

        // Añade letras aleatorias hasta alcanzar un tamaño de 12
        while (this.keyboardButtons.length < 12) {
          const randomLetter = String.fromCharCode(
            Math.floor(Math.random() * 26) + 65
          ); // Genera letras aleatorias en mayúsculas
          this.keyboardButtons.push(randomLetter);
        }

        // Mezcla aleatoriamente las letras usando el algoritmo Fisher-Yates
        for (let i = this.keyboardButtons.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [this.keyboardButtons[i], this.keyboardButtons[j]] = [
            this.keyboardButtons[j],
            this.keyboardButtons[i],
          ];
        }

        this.loadWordPictures();
        console.log(this.targetWord);
        console.log(this.correctLetters);
      }
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      }
    } finally {
    }
  }

  async loadWordPictures(): Promise<void> {
    try {
      const { error, data } = await this.supabaseService.getWordPictures(
        this.targetWord.id
      );
      if (error) {
        throw error;
      } else {
        console.log(data);
        this.pictures = data;
        this.loading = false;
      }
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      }
    } finally {
    }
  }

  selectLetter(letter: string, selectedButton: number): void {
    for (let i = 0; i < this.tryLetters.length; i++) {
      if (this.tryLetters[i].value == '') {
        this.tryLetters[i].value = letter;
        this.tryLetters[i].selectedButton = selectedButton;
        this.disabledButtons.push(selectedButton);

        // comparar palabra
        let result = this.compareWord();
        if (result == true) {
          this.onSuccess();
        } else {
          console.log('PALABRA INCORRECTA');
        }

        return;
      }
    }
  }

  removeLetter(selectedLetter: Letter): void {
    if (this.success) {
      return;
    }
    this.tryLetters.find((letter) => letter.id == selectedLetter.id)!.value =
      '';
    const index = this.disabledButtons.indexOf(selectedLetter.selectedButton!);
    this.disabledButtons.splice(index, 1);
  }

  compareWord(): boolean {
    for (let i = 0; i < this.tryLetters.length; i++) {
      if (this.tryLetters[i].value != this.correctLetters[i]) {
        return false;
      }
    }
    return true;
  }

  onSuccess(): void {
    this.success = true;
    console.log('PALABRA CORRECTA');

    confetti({
      particleCount: 180,
      spread: 100,
      origin: { y: 0.6 },
    });

    let targetWordIndex = this.words.indexOf(this.targetWord);

    if(targetWordIndex + 1 > this.words.length - 1) {
      localStorage.setItem('target_word_id', this.words[0].id);

    } else {
      localStorage.setItem('target_word_id', this.words[targetWordIndex + 1].id);
    }
 
    // Clear confetti after a certain duration
    setTimeout(() => {
      confetti.reset();
      location.reload();
    }, 3000);
  }
}
