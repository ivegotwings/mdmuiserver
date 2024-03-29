import '@polymer/polymer/polymer-legacy.js';
const $_documentContainer = document.createElement('template');

$_documentContainer.innerHTML = `<dom-module id="bedrock-style-variables">
    <template>
        <style>
            /* Application theme */
            :host>* {
                /* Theme variables*/
                --primary-color: var(--mdm-primary-color, #036bc3);
                --primary-light-color: var(--mdm-primary-light-color, #0bb2e8);
                --secondary-color: var(--mdm-secondary-color, #364653);

                /*--------------------------------------------------------
                Basic theme colors
                ---------------------------------------------------------*/

                /* Login page layout */
                --login-page-bg: var(--primary-color);
                --login-wrapper-bg: #ffffff;

                /* Header layout */
                --top-header-background: var(--primary-color);
                --top-header-search-icon-color: var(--primary-color);
                --top-header-icon-color: #ffffff;
                --top-header-font-color: #ffffff;
                --top-header-vertical-divider-color: #ffffff;
                --pagelevel-divider: #bacedf;
                --icon-color: #757575;

                /* Navigation layout */
                --left-nav-background: var(--secondary-color);
                --left-nav-over: #303d48;
                --left-nav-link-over: #78a4c7;
                --left-menu-selected-border: var(--primary-light-color);
                --left-menu-divider: #6b7d8d;
                --left-menu-icon-color: #ffffff;
                --left-menu-text-color: #ffffff;

                /* Footer layout colors */
                --rock-footer-background-color: #ffffff;
                --rock-footer-font-color: #75808b;
                --rock-footer-company: #364653;

                /* Typography colors */
                --main-content-text-color: #192027;
                --pagetitle-text-color: #034c89;
                --title-text-color: #191e22;
                --text-primary-color: #364653;
                --default-text-color: #444444;
                --primary-text-color: #212121;
                --secondary-text-color: #727272;
                --link-text-color: #036Bc3;
                --link-text-hover-color: #045aa2;
                --label-text-color: #96B0C5;
                --input-label-color: #96b0c6;
                --success-text-color: #36b44a;
                --warning-text-color: #f68d1e;
                --error-text-color: #ed204c;

                /* Success, warning and error colors */
                --success-color: #36b44a;
                --warning-color: #f68d1e;
                --error-color: #ed204c;

                /* Button colors */
                --primary-button-color: #139de6;
                --primary-button-hover-color: #118ed0;
                --primary-button-outline-hover: #eaf7fd;

                --button-text-color: #ffffff;

                --secondary-button-color: #ffffff;
                --secondary-button-border-color: #c1cad4;
                --pebble-lov-selected-item-focused-color: #c1cad4;
                --secondary-button-text-color: #75808b;
                --secondary-button-hover-color: #f3f2f2;

                --primary-border-button-color: #026bc3;
                --primary-border-button-text-color: #036bc3;

                --success-button-color: #09c021;
                --success-button-hover-color: #43af43;

                --warning-button-color: #f78e1e;
                --warning-button-hover-color: #ec971f;

                --error-button-color: #f30440;
                --error-button-hover-color: #da133d;

                --info-icon-outer-bg-color: #0bb2e8;

                /* dropdown colors */
                --dropdown-selected-border: #139de6;
                --dropdown-selected: #e8f4f9;
                --dropdown-selected-font: #036bc3;


                /* Icon colors */
                --sub-header-icon-color: #034c89;
                --card-title-icon-color: #1a2028;
                --icon-solid-bg: #ffffff;
                --primary-icon-color: #75808b;
                --secondary-icon-color: #c1cad4;
                --active-icon-color: #036bc3;
                --favorite-icon-color: #fae985;
                --favorite-icon-border-color: #f6d40c;

                /* Notification colors : pebble-badge */
                --header-notification-color: #ffffff;
                --header-notification-text-color: var(--primary-color);
                --default-notification-color: #ed204c;
                --default-notification-text-color: #ffffff;

                /* Piecharts, Graphs, Tags colors */
                --color-variant-1: #0bb2e8;
                --color-variant-2: #36b44a;
                --color-variant-3: #785da7;
                --color-variant-4: #f68d1e;
                --color-variant-5: #f5d30c;
                --color-variant-6: #ed204c;
                --color-variant-7: #1ccad5;
                --color-variant-8: #54abe4;
                --color-variant-9: #42c9b6;
                --chart-inprogress: #f2e91d;

                /* -- Font-Family variables -- */
                --default-font-family: 'Roboto', Helvetica, Arial, sans-serif;

                /* Font weight variables */
                --font-regular: 400;
                --font-medium: 500;
                --font-bold: bold;

                /* Font size variables */
                --font-size-xs: 10px;
                --font-size-sm: 12px;
                --default-font-size: 14px;
                --font-size-md: 16px;
                --font-size-lg: 18px;
                --font-size-xl: 20px;

                /* Edited Background Color */
                --edit-bgcolor: #E7F8E7;
                --edit-attribute-bgcolor: #EDF8FE;

                /* Other common variables */
                --divider-color: #c1cad4;
                --default-border-color: #c1cad4;
                --buttontext-color: #616161;

                /*--------------------------------------------------------
                Components variables
                ---------------------------------------------------------*/

                /* profile variables */
                --profile-details-bg: var(--primary-color);

                /* Accordion varables */
                --accordion-header-bg: #ffffff;

                /* Pebble - TreeNode */
                --treenode-bgcolor: #e8f3f9;

                /* DropDown Variables */
                --dropdown-selection-bg: #eaf3fc;
                --dropdown-selection-left-bar: #139de6;

                /* Checkbox/radio button varuable */
                --checkbox-default-border: #c1cad4;
                --checkbox-default-size: 14px;
                --checkbox-selected-border: #026bc3;
                --checkbox-selected-bg: #026bc3;
                --checkbox-mark: #ffffff;
                --calculated-pebble-checkbox-size: 15px;

                /* Radio Button */
                --radio-button-border: #026bc3;
                --radio-button-selected: #026bc3;

                /* Pebble Popup Variables */
                --popup-header-color: #026bc3;
                --popup-header-text-color: #ffffff;
                --popup-background-color: #ffffff;
                --popup-box-shadow: #8A98A3;
                --default-popup-t-p: 20px;
                --default-popup-b-p: 20px;
                --default-popup-item-l-p: 20px;
                --default-popup-item-r-p: 20px;

                /* Widget pannel Variables */
                --widget-panel-bg-color: #f5f7f9;
                --widget-box-bg-color: #ffffff;
                --widget-border-color: #c1cad4;

                /* Tab group Variables */
                --selected-tab-bg-color: transperent;
                --selected-tab-text-color: #c1cad4;
                --selected-tab-bottom-line-color: #026bc3;

                /* Table Variables */
                --table-border: #c1cad4;
                --table-head-bg-color: #ffffff;
                --table-row-border: #e6ebf0;
                --table-row-selected-color: #eaf3fc;

                /* Stepper Variables */
                --connected-badge-width: 50px;
                --connected-badge-height: 50px;
                --connected-badge-background: var(--cloudy-blue-color);
                --connected-childBadge-width: 18px;
                --connected-childBadge-height: 18px;
                --connected-childBadge-background: #0abf21;
                --connectorLine-width: 3px;

                /* Input style */
                --focused-line: #026bc3;
                --invalid-line: #ed204c;

                /* Pebble toast variables */
                --toast-background: #ffffff;
                --toast-font-color: #4b4e51;
                --toast-success: #09c021;
                --toast-error: #ee204c;
                --toast-warning: #f78e1e;
                --toast-information: #139ee7;

                /* pebble stepper variables */
                --completed-steper-color: #09c021;
                --inprogress-stepper-color: #026bc3;
                --failed-stepper-color: #f30440;
                --stepper-badge-text-color: #ffffff;
                --outer-badge-bg-color: #ffffff;

                /* ToDo count of activities */
                --list-item-count-wrap-border-color: #036bc3;
                --list-item-count-wrap-text-color: #036bc3;

                /* Rock entity header variables */
                --attribute-name-color: #839cb1;

                /* Color Palette */
                --palette-dark: #1a2028;
                --palette-dark-two: #192027;
                --palette-dark-three: #191e22;
                --palette-pale-grey: #e6ebf0;
                --palette-pale-grey-two: #f9fbfd;
                --palette-pale-grey-three: #e7ebf0;
                --palette-pale-grey-four: #eff4f8;
                --palette-medium-steel-grey: #7d8690;
                --palette-steel-grey: #75808b;
                --palette-white: #ffffff;
                --palette-pumpkin-orange: #f78e1e;
                --palette-goldenrod: #f6d40c;
                --palette-azure: #0bb2e8;
                --palette-cloudy-blue: #c1cad4;
                --palette-water-blue: #139de6;
                --palette-cerulean: #036bc3;
                --palette-cerulean-two: #026bc3;
                --palette-deep-sea-blue: #034c89;
                --palette-azure-two: #139ee7;
                --palette-aqua: #1ccbd5;
                --palette-deep-lavender: #785da8;
                --palette-medium-green: #36b44a;
                --palette-tree-green: #148326;
                --palette-kelly-green: #09c021;
                --palette-emerald-green: #06921c;
                --palette-pinkish-red: #ee204c;
                --palette-pale-grey-five: #f5f7f9;
                --default-tag-border: #d2d7dd;




                --dark-primary-color: #303F9F;
                --default-primary-color: #3F51B5;

                --accent-color: #81b7e5;
                --title-bgcolor: #f6f7f9;

                --disabled-text-color: #bdbdbd;

                --default-icon-color: #7f7f7f;
                --default-icon-selected: #97A1D7;




                --border-black: #000;

                --textbox-border: #d2d8de;
                /* paper-drawer-panel */
                --drawer-menu-color: red;
                --drawer-border-color: 1px solid #ccc;
                --drawer-toolbar-border-color: 1px solid rgba(0, 0, 0, 0.22);
                --drawer-submenu-background: #efefef;

                /* App header Search bar */
                --cloudy-blue-color: #c1cad4;
                --color-steal-grey: #75808b;

                /* DialogBox Title BackgroundColor */
                --azure-two: #139ee7;
                --white: #fff;

                /* Rock TitleBar Text */
                --dark-title-color: #1a2028;

                /* Icon Color */
                --icon-color: #7d8690;

                /* LeftNavigation Selected Color */
                --navselected-highlight-color: #0bb2e8;

                /* DateDropdown color */
                --datedropdown-text-color: #1a2028;

                /* OuterBadge TitleText */
                --outer-badge-color: #c1cad4;

                /* SideBar Textcolor */
                --sidebar-text-color: #1a2028;
                --button-bg-color: #09c021;
                --button-text-color: #fff;

                /* DateDropdown color */
                --sidebar-text-color: #1a2028;

                /* Rock Header Attribute Panel Text */
                --attrpanel-color-text: #1a2028;

                /* RockSearch Text color */
                --search-text-color: #75808b;

                /* paper-menu */
                --paper-menu-background-color: #fff;
                --menu-link-color: #111111;

                /* Paper-Buttons DateButtons */
                --paper-button-date: #DBE4EB;
                --pebble-lov-selected-item-background: #DBE4EB;
                --paper-button-datehover: #1976D2;

                /* Thumb image width */
                --pebble-thumb-image-size: 30px;

                /* Thumb image width */
                --pebble-icon-width: 20px;

                /* Pebble stepper vertical */
                --pebble-connected-badge-width: 35px;
                --pebble-connected-badge-height: 35px;
                --pebble-connected-badge-fontSize: 14px;

                --pebble-connected-childBadge-width: 12px;
                --pebble-connected-childBadge-height: 12px;
                --pebble-step-outer-badge-color: #c1cad4;
                --pebble-step-connected-badge-background: #e6ebf0;
                --connectorLine-color: #e0e0e0;

                /* paper-progress */
                --paper-progress-container-color: transparent;
                --paper-progress-active-color: #0EB905;
                --paper-progress-secondary-color: #ffffff;
                --paper-progress-transition-duration: 0.08s;
                --paper-progress-transition-timing-function: ease;
                --paper-progress-transition-transition-delay: 0s;


                /* Grid */
                --gutter-width: 10px;

                /* Hover */
                --bgColor-hover: #e8f4f9;

                /* Grid Hover */
                --grid-hover: #e9f1f9;

                /* Widget */
                --default-border-radius: 3px;
                --default-box-padding: 20px;
                --tab-padding-card: 15px;
                --default-margin: 10px;
                --default-tab-height: 38px;
                --default-shadow-size: 4px;
                --popup-box-shadow-size: 8px;
                --default-icon-size: 20px;
                --default-icon-color: #8994a0;
                --default-checkbox-size: 14px;
                --tag-icon-size: 20px;
                --app-header-height: 40px;
            }
        </style>
    </template>
</dom-module>`;

document.head.appendChild($_documentContainer.content);
