import {defineRouting} from 'next-intl/routing';


export const routing = defineRouting({
    // A list of all locales that are supported
    locales: ['en', 'fr','es','ar','ja','de'],

    // Used when no locale matches
    defaultLocale: 'fr'
});

export type Locale = typeof routing.locales[number];