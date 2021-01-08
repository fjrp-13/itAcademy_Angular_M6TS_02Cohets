"use strict";
var Booster = /** @class */ (function () {
    function Booster(power) {
        this.power = power;
        this.remainingPower = power;
        this.usedPower = 0;
    }
    Booster.prototype.restart = function () {
        this.remainingPower = this.power;
        this.usedPower = 0;
    };
    return Booster;
}());
