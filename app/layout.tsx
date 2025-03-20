
export default async function LocaleLayout({
                                               children}: {
    children: React.ReactNode;
}) {


    return (
        <html lang={'en'}>
        <body>

                    {children}

        </body>
        </html>
    );
}