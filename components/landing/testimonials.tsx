export function Testimonials () {
    return (
        <section className="w-full py-12 md:py-24 lg:py-32 bg-background dark:bg-gray-950 ">
            <div className="container px-4 md:px-6">
                <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
                    <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                        Ce que disent nos utilisateurs
                    </h2>
                    <p className="max-w-[700px] text-muted-foreground md:text-xl">
                        Découvrez comment CodeGrade transforme l&apos;expérience d&apos;enseignement et d&apos;apprentissage.
                    </p>
                </div>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {[
                        {
                            quote:
                                "CodeGrade a révolutionné ma façon d'enseigner la programmation. L'évaluation automatique me fait gagner des heures chaque semaine.",
                            author: "Dr. Sophie Martin",
                            role: "Professeure d'informatique, Université de Paris",
                        },
                        {
                            quote:
                                "La détection de plagiat et les analyses détaillées m'ont permis d'identifier rapidement les étudiants qui ont besoin d'aide supplémentaire.",
                            author: "Thomas Dubois",
                            role: "Enseignant en développement web, École 42",
                        },
                        {
                            quote:
                                "Les retours instantanés et personnalisés ont considérablement amélioré ma compréhension des concepts de programmation.",
                            author: "Léa Moreau",
                            role: "Étudiante en informatique",
                        },
                    ].map((testimonial, i) => (
                        <div key={i} className="flex flex-col gap-2 rounded-lg border bg-muted dark:bg-gray-900 p-6">
                            <p className="text-muted-foreground italic">{testimonial.quote}</p>
                            <div className="mt-auto pt-4">
                                <p className="font-medium">{testimonial.author}</p>
                                <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>

    );
}