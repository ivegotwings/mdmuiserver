import { timeOut } from '@polymer/polymer/lib/utils/async.js';
window.SecurityContextHelper = window.SecurityContextHelper || {};

SecurityContextHelper.logout = function () {
    let appCommon = RUFUtilities.appCommon;
    appCommon.fire("bedrock-event", {
            name:"user-logout",
            data:null
        });
    //need delay to logout from sisense first.
    timeOut.after(1000).run(() => {
        window.history.pushState('', 'Riversand Platform', '/logout');
        window.location.reload(true)                    
    });
};
