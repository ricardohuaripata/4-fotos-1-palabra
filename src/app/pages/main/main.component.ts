import { Component, OnInit } from '@angular/core';
import { SupabaseService } from '../../services/supabase.service';

interface Letter {
  id?: number;
  value?: string;
  selectedButton?: number;
}

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss',
})
export class MainComponent implements OnInit {
  words: any[] = [];
  targetWord: any;
  pictures: any[] = [];
  loading = false;
  correctLetters: string[] = [];
  keyboardButtons: string[] = []; //Array.from({ length: 26 }, (_, i) => String.fromCharCode('A'.charCodeAt(0) + i));
  disabledButtons: number[] = [];
  tryLetters: Letter[] = [];

  constructor(private readonly supabaseService: SupabaseService) {}

  ngOnInit(): void {
    this.loadWords();
  }

  async loadWords(): Promise<void> {
    this.loading = true;
    try {
      const { error, data } = await this.supabaseService.getWords();
      if (error) {
        throw error;
      } else {
        console.log(data);
        this.words = data;
        this.targetWord = data[0];
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

  selectLetter(letter: string, selectedButton: number) {

    for (let i = 0; i < this.tryLetters.length; i++) {
      if (this.tryLetters[i].value == '') {
        this.tryLetters[i].value = letter;
        this.tryLetters[i].selectedButton = selectedButton;
        this.disabledButtons.push(selectedButton);
        return;
      }
    }
  }

  removeLetter(selectedLetter: Letter) {
    this.tryLetters.find((letter) => letter.id == selectedLetter.id)!.value = '';
    const index = this.disabledButtons.indexOf(selectedLetter.selectedButton!);
    this.disabledButtons.splice(index, 1);
  }
}
