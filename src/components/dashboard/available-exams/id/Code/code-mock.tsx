// Ce fichier simule un backend pour l'exécution du Code
// Dans une application réelle, vous utiliseriez un backend sécurisé

export function executeJavaScript(code: string): string {
    try {
        // Simuler l'exécution de JavaScript
        // Note: Dans une application réelle, n'exécutez JAMAIS eval() sur du Code utilisateur
        // Utilisez plutôt un backend sécurisé ou un environnement sandbox

        // Capturer les sorties console.log
        let output = "Console output:\n"
        const originalConsoleLog = console.log
        const logs: string[] = []

        // Remplacer temporairement console.log
        console.log = (...args) => {
            logs.push(args.map((arg) => (typeof arg === "object" ? JSON.stringify(arg) : String(arg))).join(" "))
        }

        // Simuler l'exécution (ne pas utiliser eval dans une vraie application)
        if (code.includes("bubbleSort")) {
            // Simuler un tri à bulles
            if (code.includes("for") && code.includes("if") && code.includes("temp")) {
                logs.push("Tri à bulles exécuté avec succès!")
                logs.push("[11, 12, 22, 25, 34, 64, 90]")
            } else {
                logs.push("Le tri ne semble pas fonctionner correctement.")
            }
        } else if (code.includes("console.log")) {
            logs.push("Hello, world!")
            logs.push("Result: 42")
        } else {
            logs.push("No output")
        }

        // Restaurer console.log
        console.log = originalConsoleLog

        // Ajouter les logs à la sortie
        output += logs.map((log) => `> ${log}`).join("\n")

        return output
    } catch (error) {
        return `Error: ${error instanceof Error ? error.message : String(error)}`
    }
}

export function executeCode(code: string, language: string): string {
    switch (language) {
        case "javascript":
            return executeJavaScript(code)
        case "python":
            // Simulation améliorée pour Python
            if (code.includes("bubble_sort") && code.includes("for") && code.includes("range")) {
                return `Simulation d'exécution de code Python:
> Compilation réussie
> Exécution...
> [11, 12, 22, 25, 34, 64, 90]
> Terminé avec le code de sortie 0`
            } else {
                return `Simulation d'exécution de code Python:
> Compilation réussie
> Exécution...
> print("Hello, world!")
> Hello, world!
> Terminé avec le code de sortie 0`
            }
        case "java":
            // Simulation améliorée pour Java
            if (code.includes("bubbleSort") && code.includes("for") && code.includes("temp")) {
                return `Simulation d'exécution de code Java:
> Compilation réussie
> Exécution...
> Tableau trié: 11 12 22 25 34 64 90
> Terminé avec le code de sortie 0`
            } else {
                return `Simulation d'exécution de code Java:
> Compilation réussie
> Exécution...
> System.out.println("Hello, world!");
> Hello, world!
> Terminé avec le code de sortie 0`
            }
        case "cpp":
            // Simulation améliorée pour C++
            if (code.includes("bubbleSort") && code.includes("for") && code.includes("temp")) {
                return `Simulation d'exécution de code C++:
> Compilation réussie
> Exécution...
> Tableau trié: 11 12 22 25 34 64 90
> Terminé avec le code de sortie 0`
            } else {
                return `Simulation d'exécution de code C++:
> Compilation réussie
> Exécution...
> std::cout << "Hello, world!" << std::endl;\n> Hello, world!\n> Terminé avec le code de sortie 0`
            }
        case "csharp":
            // Simulation améliorée pour C#
            if (code.includes("Sort") && code.includes("for") && code.includes("temp")) {
                return `Simulation d'exécution de code C#:
> Compilation réussie
> Exécution...
> Tableau trié: 11 12 22 25 34 64 90
> Terminé avec le code de sortie 0`
            } else {
                return `Simulation d'exécution de code C#:
> Compilation réussie
> Exécution...
> Console.WriteLine("Hello, world!");
> Hello, world!
> Terminé avec le code de sortie 0`
            }
        default:
            return `Langage non supporté: ${language}`
    }
}

export function runTests(code: string, tests: any[], language: string): any[] {
    // Simuler l'exécution des tests
    return tests.map((test) => {
        // Simuler un résultat aléatoire pour la démo
        // Dans une vraie implémentation, vous exécuteriez réellement les tests
        const passed = Math.random() > 0.3 // 70% de chance de réussite

        return {
            testId: test.id,
            passed,
            output: passed ? test.expectedOutput : "Résultat incorrect",
            expected: test.expectedOutput,
        }
    })
}

