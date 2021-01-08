"use strict";
var Rocket = /** @class */ (function () {
    function Rocket(code, numBoosters, boostersPower) {
        this.PARAMS = {
            emptyClass: 'booster-empty',
            winnerClass: 'winner',
            disabledClass: 'disabled',
        };
        this.pos = -1;
        this.currentPower = 0;
        this.boosters = new Array();
        this.code = code;
        this.numBoosters = numBoosters;
        for (var _i = 0, boostersPower_1 = boostersPower; _i < boostersPower_1.length; _i++) {
            var bp = boostersPower_1[_i];
            this.addBooster(new Booster(bp));
        }
    }
    /* Añade un propulsor al cohete */
    Rocket.prototype.addBooster = function (booster) {
        this.boosters.push(booster);
    };
    /* Devuelve el nº de propulsores que tiene el cohete */
    Rocket.prototype.numPropulsores = function () {
        return this.boosters.length;
    };
    /* Devuelve un array con la potencia de los propulsores del cohete */
    Rocket.prototype.boostersPower = function () {
        var _powerList = new Array();
        for (var _i = 0, _a = this.boosters; _i < _a.length; _i++) {
            var b = _a[_i];
            _powerList.push(b.power);
        }
        return _powerList;
    };
    /* Devuelve en formato CSV la potencia de los propulsores del cohete */
    Rocket.prototype.boostersPowerCSV = function () {
        var _powerList = new Array();
        for (var _i = 0, _a = this.boosters; _i < _a.length; _i++) {
            var b = _a[_i];
            _powerList.push(b.power);
        }
        return _powerList.join(',');
    };
    /* Devuelve la potencia total del cohete */
    Rocket.prototype.totalPower = function () {
        var _totalPower = 0;
        for (var _i = 0, _a = this.boosters; _i < _a.length; _i++) {
            var b = _a[_i];
            _totalPower += b.power;
        }
        return _totalPower;
    };
    /* Devuelve la potencia restante del cohete */
    Rocket.prototype.remainingPower = function () {
        var _remainingPower = 0;
        for (var _i = 0, _a = this.boosters; _i < _a.length; _i++) {
            var b = _a[_i];
            _remainingPower += b.remainingPower;
        }
        return _remainingPower;
    };
    /* Resetea el cohete */
    Rocket.prototype.restart = function () {
        for (var _i = 0, _a = this.boosters; _i < _a.length; _i++) {
            var b = _a[_i];
            b.restart();
        }
        this.currentPower = 0;
        this.resetRocket();
    };
    /* Acelera el cohete
        @Params:
        - powerMovemenUnid: unidades del propulsor a utilizar
        - rocketStep: valor de cada movimiento/desplazamiento del cohete
        - acumulateAccelerations:
            true = cada aceleración, deberá recuperarse con frenazo (aunque no tenga potencia)
                    si aceleramos 2 veces sin potencia, para recuperar la potencia deberemos frenar 2 veces
            false = una aceleración sin potencia, no hace nada
    */
    Rocket.prototype.accelerate = function (powerMovementUnit, rocketStep, acumulateAccelerations) {
        if (acumulateAccelerations === void 0) { acumulateAccelerations = true; }
        var _movementPower = 0;
        if (this.remainingPower() > 0) {
            for (var _i = 0, _a = this.boosters; _i < _a.length; _i++) {
                var b = _a[_i];
                // Mirar si al propulsor le queda potencia
                if (b.remainingPower > 0) {
                    // Si no le queda suficiente potencia para un impulso completo, usamos la potencia que le queda
                    if (b.remainingPower < powerMovementUnit) {
                        _movementPower += b.remainingPower;
                        b.remainingPower = 0;
                        b.usedPower += b.remainingPower;
                    }
                    else {
                        _movementPower += powerMovementUnit;
                        b.remainingPower -= powerMovementUnit;
                        b.usedPower += powerMovementUnit;
                    }
                }
                else if (acumulateAccelerations) {
                    // Si no le queda potencia, igualmente incrementamos la potencia utilizada para requiera de un "frenado extra" para recuperar la potencia
                    b.usedPower += powerMovementUnit;
                }
            }
            this.currentPower += _movementPower;
            // Movimiento del cohete: "Unidades a mover" * "valor de un paso del cohete"
            //let rocketMovement: number = Math.ceil((_movementPower / powerMovementUnit) * rocketStep);
            this.updateRocket(rocketStep);
        }
        //moveRocket(this.pos, this.currentPower);
    };
    /* Frena el cohete
        @Params:
        - powerMovemenUnid: unidades del propulsor a utilizar
        - rocketStep: valor de cada movimiento/desplazamiento del cohete
    */
    Rocket.prototype.brake = function (powerMovementUnit, rocketStep) {
        // Si no ha usado potencia, no puede retroceder
        if (this.currentPower == 0) {
            return;
        }
        var _movementPower = 0;
        for (var _i = 0, _a = this.boosters; _i < _a.length; _i++) {
            var b = _a[_i];
            // Mirar si el propulsor tiene potencia recuperable
            if (b.usedPower > 0) {
                if (b.usedPower > b.power) {
                    // Recuperar la "potencia no utilizada" por haberla gastado
                    b.usedPower -= powerMovementUnit;
                }
                else {
                    // Si NO tiene suficiente potencia recuperable para un impulso completo, usamos la potencia recuperable que tenga
                    if (b.usedPower < powerMovementUnit) {
                        _movementPower += b.usedPower;
                        b.remainingPower += b.usedPower;
                        b.usedPower = 0;
                    }
                    else {
                        _movementPower += powerMovementUnit;
                        b.remainingPower += powerMovementUnit;
                        b.usedPower -= powerMovementUnit;
                    }
                }
            }
        }
        this.currentPower -= _movementPower;
        // Movimiento del cohete: "Unidades a mover" * "valor de un paso del cohete"
        //let rocketMovement: number = Math.ceil((_movementPower / powerMovementUnit) * rocketStep);
        this.updateRocket(rocketStep);
    };
    /* Actualiza el cohete
    @Params:
    - rocketStep: valor de cada movimiento/desplazamiento del cohete
    */
    Rocket.prototype.updateRocket = function (rocketStep) {
        // Update rocket in the table
        var row = document.getElementById('rocketRow' + this.pos.toString());
        var colCurrentPower = row.getElementsByClassName('current-power')[0];
        var colRemainingPower = row.getElementsByClassName('remaining-power')[0];
        colCurrentPower.innerText = this.currentPower.toString();
        colRemainingPower.innerText = this.remainingPower().toString();
        // Move rocket icon
        this.moveIcon(rocketStep);
        if (this.remainingPower() > 0) {
            var iconRocket = document.getElementById("rocket-" + this.pos.toString());
            iconRocket.classList.remove(this.PARAMS.emptyClass);
        }
        else {
            var iconRocket = document.getElementById("rocket-" + this.pos.toString());
            iconRocket.classList.add(this.PARAMS.emptyClass);
        }
    };
    /* Resetea el cohete */
    Rocket.prototype.resetRocket = function () {
        // Update rocket in the table
        var row = document.getElementById('rocketRow' + this.pos.toString());
        var colCurrentPower = row.getElementsByClassName('current-power')[0];
        var colRemainingPower = row.getElementsByClassName('remaining-power')[0];
        colCurrentPower.innerText = this.currentPower.toString();
        colRemainingPower.innerText = this.remainingPower().toString();
        this.resetIcon();
        this.checkEmpty();
        this.winner(false); // desmarca el ganador
        this.disableJoysticks(false); // habilita los joysticks
    };
    /* Revisa si al cohete le queda potencia. Si no le queda, lo marca como "vacío" */
    Rocket.prototype.checkEmpty = function () {
        var iconRocket = document.getElementById("rocket-" + this.pos.toString());
        if (this.remainingPower() > 0) {
            iconRocket.classList.remove(this.PARAMS.emptyClass);
        }
        else {
            iconRocket.classList.add(this.PARAMS.emptyClass);
        }
    };
    /* Resetea el icono del cohete al inicio de la carrera */
    Rocket.prototype.resetIcon = function () {
        var iconRocket = document.getElementById("rocket-" + this.pos.toString());
        var raceStadium = iconRocket.closest('#race-stadium');
        iconRocket.style.left = "0px";
    };
    /* Mueve el icono del cohete
        @Params:
        - rocketStep: valor de cada movimiento/desplazamiento del cohete
    */
    Rocket.prototype.moveIcon = function (rocketStep) {
        var iconRocket = document.getElementById('rocket-' + this.pos.toString());
        var raceLane = iconRocket.closest('.rocket-lane');
        var raceStadium = iconRocket.closest('#race-stadium');
        var finishLine = raceStadium.offsetWidth;
        var rocketWidth = iconRocket.offsetWidth;
        var newIconLeft = Math.ceil(this.currentPower * rocketStep);
        raceLane.style.paddingLeft = newIconLeft.toString() + "px";
        if (newIconLeft + rocketWidth >= finishLine) {
            this.winner(true);
        }
    };
    /* Marca el cohete como ganador
        @Params:
        - isWinner:
            true: marca el cohete como ganador
            false: desmarca el cohete como ganador
    */
    Rocket.prototype.winner = function (isWinner) {
        var iconRocket = document.getElementById("rocket-" + this.pos.toString());
        var raceLane = iconRocket.closest('.rocket-lane');
        if (isWinner) {
            var _rocket_1 = this;
            setTimeout(function () {
                raceLane.classList.add(_rocket_1.PARAMS.winnerClass);
                raceLane.style.paddingLeft = "";
            }, 1000);
        }
        else {
            raceLane.classList.remove(this.PARAMS.winnerClass);
            raceLane.style.paddingLeft = "";
        }
        this.disableJoysticks(isWinner);
    };
    /* Habilita/deshabilita los joystick
        @Params:
            true: deshabilita los joysticks
            false: habilita los joysticks
    */
    Rocket.prototype.disableJoysticks = function (disable) {
        var joystick = document.getElementsByClassName('rocket-joystick-item');
        for (var i = 0; i < joystick.length; i++) {
            if (disable) {
                joystick[i].classList.add(this.PARAMS.disabledClass);
            }
            else {
                joystick[i].classList.remove(this.PARAMS.disabledClass);
            }
        }
    };
    return Rocket;
}());
