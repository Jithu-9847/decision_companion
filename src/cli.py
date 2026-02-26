import argparse
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from src.models import Decision, Criterion, Option, UserProfile
from src.evaluator import Evaluator
from src.storage import Storage
from rich.console import Console
from rich.table import Table
from rich.panel import Panel
from rich.prompt import Prompt, FloatPrompt, IntPrompt
from rich.text import Text
console = Console()

def clear_screen():
    os.system('cls' if os.name == 'nt' else 'clear')

def print_header(title):
    console.print(Panel(f'[bold cyan]{title}[/bold cyan]', expand=False, border_style='blue'))

def main():
    parser = argparse.ArgumentParser(description='Decision Companion System')
    parser.add_argument('--file', type=str, help='Path to JSON file to load/save decision')
    args = parser.parse_args()
    clear_screen()
    print_header('Welcome to the Decision Companion System!')
    console.print('[italic]This tool helps you evaluate multiple options against weighted criteria.[/italic]\n')
    profile = UserProfile()
    decision = None
    if args.file and os.path.exists(args.file):
        try:
            profile = Storage.load_profile(args.file)
            console.print(f'[green]Loaded User Profile with {len(profile.decision_history)} past decisions.[/green]')
            if profile.decision_history:
                decision = profile.decision_history[-1]
                console.print(f'[green]Continuing decision:[/green] [bold]{decision.name}[/bold]\n')
        except Exception as e:
            console.print(f'[red]Error loading file:[/red] {e}')
            sys.exit(1)
    if not decision:
        name = Prompt.ask("[bold cyan]Enter what you are deciding[/bold cyan] (e.g., 'Choosing a laptop')")
        desc = Prompt.ask('[bold cyan]Enter a brief description[/bold cyan] (optional)')
        decision = Decision(name=name, description=desc)
        profile.decision_history.append(decision)
    while True:
        clear_screen()
        print_header(f'Current Decision: {decision.name}')
        menu = Table.grid(padding=(0, 2))
        menu.add_column(justify='right', style='bold green')
        menu.add_column(style='white')
        menu.add_row('1.', 'Add / Edit Criterion')
        menu.add_row('2.', 'Add / Edit Option')
        menu.add_row('3.', 'Rate Options')
        menu.add_row('4.', 'Evaluate Decision')
        menu.add_row('5.', 'Finalize Decision (Reinforcement Learning)')
        menu.add_row('6.', 'Save Profile')
        menu.add_row('7.', 'Exit')
        console.print(menu)
        choice = Prompt.ask('\n[bold yellow]Select an action[/bold yellow]', choices=['1', '2', '3', '4', '5', '6', '7'])
        console.print()
        if choice == '1':
            c_name = Prompt.ask("[cyan]Enter criterion name[/cyan] (e.g., 'Price')")
            c_weight = FloatPrompt.ask('[cyan]Enter weight[/cyan] (1-10, 10 being most important)')
            existing = decision.get_criterion_by_name(c_name)
            if existing:
                existing.weight = c_weight
                console.print(f'[green]✔ Updated {c_name} to weight {c_weight}[/green]')
            else:
                decision.criteria.append(Criterion(name=c_name, weight=c_weight))
                console.print(f"[green]✔ Added criterion '{c_name}' with weight {c_weight}[/green]")
        elif choice == '2':
            o_name = Prompt.ask("[cyan]Enter option name[/cyan] (e.g., 'MacBook Air')")
            existing = decision.get_option_by_name(o_name)
            if existing:
                console.print(f"[yellow]⚠ Option '{o_name}' already exists.[/yellow]")
            else:
                decision.options.append(Option(name=o_name))
                console.print(f"[green]✔ Added option '{o_name}'[/green]")
        elif choice == '3':
            if not decision.criteria:
                console.print('[red]Error: Please add at least one criterion first.[/red]')
            elif not decision.options:
                console.print('[red]Error: Please add at least one option first.[/red]')
            else:
                console.print(Panel('[bold]Rating Options (Rate 1-10)[/bold]', expand=False))
                for option in decision.options:
                    console.print(f'\n[bold magenta]Rating for {option.name}:[/bold magenta]')
                    for criterion in decision.criteria:
                        current_score = option.scores.get(criterion.id, 0.0)
                        score_input = Prompt.ask(f'  [cyan]{criterion.name}[/cyan] (Weight: {criterion.weight}) [dim]\\[Current: {current_score}][/dim]', default=str(current_score))
                        try:
                            score_val = float(score_input)
                            option.scores[criterion.id] = score_val
                        except ValueError:
                            console.print('  [red]Invalid input, keeping previous score.[/red]')
                console.print('\n[green]✔ Ratings updated.[/green]')
        elif choice == '4':
            if not decision.options or not decision.criteria:
                console.print('[red]Error: You need at least one option and one criterion to evaluate.[/red]')
            else:
                results = Evaluator.evaluate(decision, user_profile=profile)
                table = Table(title='EVALUATION RESULTS', show_header=True, header_style='bold magenta')
                table.add_column('Rank', justify='center')
                table.add_column('Option', style='cyan', no_wrap=True)
                table.add_column('Fuzzy Score', justify='right', style='green')
                table.add_column('Reasoning')
                for (i, (option, score, explanation)) in enumerate(results, 1):
                    table.add_row(str(i), option.name, f'{score:.2f}', explanation)
                console.print(table)
                console.print('\n[dim]Insight: The Fuzzy Inference System computes membership functions and rules to output an explainable score.[/dim]')
                console.print('[dim]         (Note: Your past choices influence the weights automatically!)[/dim]')
        elif choice == '5':
            if not decision.options or not decision.criteria:
                console.print('[red]Error: You need at least one option and one criterion before finalizing.[/red]')
            else:
                console.print(Panel('[bold magenta]Finalizing Decision...[/bold magenta]', expand=False))
                results = Evaluator.evaluate(decision, user_profile=profile)
                console.print('\n[bold]Top choices:[/bold]')
                for (i, (option, score, _)) in enumerate(results[:3], 1):
                    console.print(f'  [cyan]{i}. {option.name}[/cyan] (Score: {score:.2f})')
                winner_idx = IntPrompt.ask('\n[bold yellow]Which option did you actually choose?[/bold yellow]', choices=[str(i) for i in range(1, len(results) + 1)])
                try:
                    winner = results[winner_idx - 1][0]
                    console.print(f"\n[bold green]Awesome! You chose '{winner.name}'.[/bold green]")
                    console.print('Updating your global profile weighting preferences...')
                    for crit in decision.criteria:
                        score = winner.scores.get(crit.id, 0.0)
                        if score >= 5.0:
                            score_multiplier = score / 10.0
                            scaled_new_weight = crit.weight * score_multiplier
                            profile.update_learned_weight(crit.name, scaled_new_weight)
                            console.print(f"  [blue]Learned: You value '{crit.name}'[/blue] (Impact: {score_multiplier:.1f}x)")
                    console.print('\n[bold green]✔ Decision final. Starting a new decision...[/bold green]')
                    name = Prompt.ask('[bold cyan]Enter what you are deciding next[/bold cyan]')
                    desc = Prompt.ask('[bold cyan]Enter a brief description[/bold cyan] (optional)')
                    decision = Decision(name=name, description=desc)
                    profile.decision_history.append(decision)
                except (ValueError, IndexError):
                    console.print('[red]Invalid selection.[/red]')
        elif choice == '6':
            save_path = args.file or '{}'
            if args.file:
                default_path = args.file
            else:
                default_path = 'profile.json'
            save_path = Prompt.ask(f'[cyan]Enter filename to save[/cyan]', default=default_path)
            if save_path:
                Storage.save_profile(profile, save_path)
                args.file = save_path
                console.print(f'[green]✔ Profile saved successfully![/green]')
        elif choice == '7':
            console.print('[bold green]Exiting. Goodbye![/bold green]')
            sys.exit(0)
        Prompt.ask('\n[dim]Press Enter to continue...[/dim]', default='')
if __name__ == '__main__':
    main()
