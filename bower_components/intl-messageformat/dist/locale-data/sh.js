IntlMessageFormat.__addLocaleData({"locale":"sh","pluralRuleFunction":function (n,ord){var s=String(n).split("."),i=s[0],f=s[1]||"",v0=!s[1],i10=i.slice(-1),i100=i.slice(-2),f10=f.slice(-1),f100=f.slice(-2);if(ord)return"other";return v0&&i10==1&&i100!=11||f10==1&&f100!=11?"one":v0&&(i10>=2&&i10<=4)&&(i100<12||i100>14)||f10>=2&&f10<=4&&(f100<12||f100>14)?"few":"other"}});
