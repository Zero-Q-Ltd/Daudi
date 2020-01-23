function makeAppConfig() {
    const date = new Date();
    const year = date.getFullYear();

    const AppConfig = {
        brand: 'DAUDI 4.0.0',
        user: 'Zero-Q',
        year: '2019',
        layoutBoxed: false,               // true, false
        navCollapsed: true,              // true, false
        navBehind: false,                 // true, false
        fixedHeader: true,                // true, false
        sidebarWidth: 'small',           // small, middle, large
        theme: 'light',                   // light, gray, dark
        colorOption: '32',                // 11,12,13,14,15,16; 21,22,23,24,25,26; 31,32,33,34,35,36
        AutoCloseMobileNav: true,         // true, false. Automatically close sidenav on route change (Mobile only)
        productLink: '#'
    };

    return AppConfig;
}

export const APPCONFIG = makeAppConfig();
