/* eslint-disable fecs-max-statements, babel/new-cap*/
;(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(<%= amd %>, factory);
    }
    else if (typeof exports === 'object') {
        module.exports = factory(<%= cjs %>);
    }
    else {
        root.<%= namespace %> = factory(<%= global %>);
    }
}(this, function (<%= param %>) {
<%= contents %>
    return <%= exports %>;
}));
/* eslint-disable fecs-max-statements, babel/new-cap*/
