import Modal from "../../js/bootstrap/modal";

(function(){
    function Modals(){

    };

    var modalStack = [];

    Modals.prototype.config = {
        mode: 'normal',
    };

    Modals.prototype.pop = function() {
        return modalStack.pop();
    };

    Modals.prototype.push = function(modal) {
        modalStack.push(modal);
    };

    Modals.prototype.isEmpty = function() {
        return modalStack.length == 0;
    };

    window.modals = new Modals();
})();