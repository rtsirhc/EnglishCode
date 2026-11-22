import tkinter as tk
from tkinter import messagebox

class MegaSpellingTrivia:
    def __init__(self, root):
        self.root = root
        self.root.title("MISSION: 30-STAGE OVERRIDE")
        self.root.geometry("1100x800")
        self.root.configure(bg='#050510')

        # 30 Unique Challenges: Vocabulary + Trivia
        self.challenges = [
            ("A movie or show that uses facts to tell a story.", "documentary"),
            ("TRIVIA: Which planet is known as the 'Red Planet'?", "mars"),
            ("A healthy food like a carrot or broccoli.", "vegetable"),
            ("The process of plants making food from sunlight.", "photosynthesis"),
            ("TRIVIA: What is the largest ocean on Earth?", "pacific"),
            ("A vehicle designed for travel in outer space.", "spacecraft"),
            ("The layer of air that surrounds our planet.", "atmosphere"),
            ("TRIVIA: How many colors are in a rainbow?", "seven"),
            ("When a type of animal disappears from Earth forever.", "extinction"),
            ("The study of living things like plants and animals.", "biology"),
            ("TRIVIA: What is the capital of France?", "paris"),
            ("A sudden, violent shaking of the ground.", "earthquake"),
            ("The measurement of how hot or cold it is.", "temperature"),
            ("Something very smart or clever.", "intelligent"),
            ("TRIVIA: Who painted the Mona Lisa?", "da vinci"),
            ("An animal that eats both plants and meat.", "omnivore"),
            ("A large piece of land, like a continent.", "landmass"),
            ("TRIVIA: What is the hardest natural substance on Earth?", "diamond"),
            ("A card that asks someone to come to a party.", "invitation"),
            ("The general weather of a place over a long time.", "climate"),
            ("TRIVIA: Which country has the most people?", "india"),
            ("A machine used to print books and newspapers.", "printing press"),
            ("The natural world around us (air, water, land).", "environment"),
            ("TRIVIA: What is the fastest land animal?", "cheetah"),
            ("The power inside a cell that gives it energy.", "mitochondria"),
            ("Something that is very beautiful or charming.", "attractive"),
            ("TRIVIA: How many bones are in the adult human body?", "206"),
            ("A movie or show that is very funny.", "comedy"),
            ("Something that is very important or valuable.", "precious"),
            ("The language you are speaking and practicing now!", "english")
        ]
        
        self.stage = 0

        # Big Visual UI
        self.title_label = tk.Label(root, text="SYSTEM STATUS: MEGA CHALLENGE", 
                                    fg='#ff00ff', bg='#050510', font=("Courier", 34, "bold"))
        self.title_label.pack(pady=40)

        self.clue_box = tk.Label(root, text="", fg='#ffffff', bg='#111122', 
                                 font=("Arial", 24, "italic"), wraplength=900, 
                                 padx=40, pady=40, relief="flat")
        self.clue_box.pack(pady=20)

        self.entry_field = tk.Entry(root, font=("Arial", 34), justify='center', 
                                    bg='#222233', fg='#00ffcc', insertbackground='#ffffff')
        self.entry_field.pack(pady=40, ipady=15)
        self.entry_field.focus_set()
        self.entry_field.bind('<Return>', lambda e: self.verify())

        self.status_text = tk.Label(root, text="", fg='#ffcc00', bg='#050510', font=("Courier", 18))
        self.status_text.pack(side="bottom", pady=40)

        self.refresh()

    def refresh(self):
        if self.stage < len(self.challenges):
            clue, _ = self.challenges[self.stage]
            self.clue_box.config(text=f"CHALLENGE: {clue}")
            self.status_text.config(text=f"PROGRESS: {self.stage + 1} / {len(self.challenges)}")
            self.entry_field.delete(0, tk.END)
        else:
            messagebox.showinfo("VICTORY", "30/30 COMPLETE! System Fully Unlocked.")
            self.root.destroy()

    def verify(self):
        answer = self.entry_field.get().strip().lower()
        _, correct = self.challenges[self.stage]
        if answer == correct.lower():
            self.stage += 1
            self.refresh()
        else:
            messagebox.showerror("DENIED", "Incorrect! Review your data and try again.")

if __name__ == "__main__":
    root = tk.Tk()
    app = MegaSpellingTrivia(root)
    root.mainloop()
