"use strict";
// Objeto genérico con configuraciones de la aplicación
var APP_CONFIG = {
    errorFieldSuffix: "Error",
    invalidClass: 'is-invalid',
    rocketCodeRegExp: '^[0-9a-zA-Z]{8}$',
    rocketPowerRegExp: '^(\\d+)(,\\s*\\d+)*$',
    powerMovementUnit: 10,
    powerStepsToFinish: 12,
};
// Calculamos el valor de cada STEP del cohete (redondeado a 2 decimales)
var rocketStep = getRocketStepValue();
/*-------------------- FUNCIONES GENÉRICAS (ini) --------------------*/
// Resetear los campos "invalid" (quitar clase y vaciar su "invalid-feedback" asociado)
var resetInvalidField = function (field) {
    field.classList.remove(APP_CONFIG.invalidClass);
    var invalid = document.getElementById(field.id + APP_CONFIG.errorFieldSuffix);
    invalid.textContent = '';
};
// Marcar un campo como "invalid" y añadir el mensaje a su "invalid-feedback" asociado
var setInvalidField = function (field, errorMsg) {
    field.classList.add(APP_CONFIG.invalidClass);
    var invalid = document.getElementById(field.id + APP_CONFIG.errorFieldSuffix);
    invalid.textContent = errorMsg;
};
// Convertir un string a number
var convertStringToNumber = function (input) {
    if (!input)
        return NaN;
    if (input.trim().length == 0) {
        return NaN;
    }
    return Number(input);
};
// Convertir un NaN a 0
var isNaNto0 = function (num) {
    if (isNaN(num)) {
        num = 0;
    }
    return num;
};
/*-------------------- FUNCIONES GENÉRICAS (fin) --------------------*/
/*-------------------- TEMPLATES HTML (ini) --------------------*/
// Template para crear las filas de la tabla de cohetes
var ROCKET_TABLE_TEMPLATE = [
    '<tr id="rowCar{{ROCKET_POS}}">',
    '<td class="joystick">{{ROCKET_JOYSTICK}}</td>',
    '<th>{{ROCKET_CODE}}</th>',
    '<td>{{ROCKET_NUM_BOOSTERS}}</td>',
    '<td>{{ROCKET_BOOSTERS_POWERS}}</td>',
    '<td>{{ROCKET_POWER}}</td>',
    '<td class="current-power">{{ROCKET_CURRENT_POWER}}</td>',
    '<td class="remaining-power">{{ROCKET_REMAINING_POWER}}</td>',
    '</tr>'
].join('');
// Template para crear el joystic del cohete
var ROCKET_JOYSTICK_TEMPLATE = [
    //<nav class="rocket-controller">',
    '<ul class="rocket-joystick pagination">',
    '<li class="page-item rocket-joystick-item disabled">',
    '<a href="#" class="page-link" aria-label="Step back" onclick="brakeRocket(\'{{ROCKET_POS}}\'); return false;">',
    '<span aria-hidden="true">&laquo;</span>',
    '</a>',
    '</li>',
    '<li class="page-item rocket-joystick-item disabled">',
    '<a href="#" class="page-link" aria-label="Step forward" onclick="accelerateRocket(\'{{ROCKET_POS}}\'); return false;">',
    '<span aria-hidden="true">&raquo;</span>',
    '</a>',
    '</li>',
    '</ul>' //,
    //'</nav>'
].join('');
// Template para crear la línea de carrera del cohete
var ROCKET_RACE_LANE = [
    '<div class="rocket-lane">',
    '<div id="rocket-{{ROCKET_POS}}" class="rocket-lane-icon">',
    '<div class="rocket-lane-title">',
    '<div>#{{ROCKET_POS}}</div>',
    '<div>{{ROCKET_CODE}}</div>',
    '</div>',
    '<i class="fa fa-rocket rotate-45-right" aria-hidden="true"></i>',
    '</div>',
    '</div>'
].join('');
/*-------------------- TEMPLATES HTML (fin) --------------------*/
// Variables globales para guardar los objetos Car
var rockets = [];
var rocket;
// Crear un elemento "Rocket" y lo añade al array
function createRocket(code, numBoosters, boostersPower) {
    rocket = new Rocket(code, numBoosters, boostersPower);
    rockets.push(rocket);
    rocket.pos = rockets.length;
}
// Validar el formato del código del cohete
function validateRocketCode(rocketCode) {
    var regexp = new RegExp(APP_CONFIG.rocketCodeRegExp, 'gi');
    return regexp.test(rocketCode);
}
// Validar el nº de propulsores
function validateNumBoosters(numBoosters) {
    if (isNaN(numBoosters)) {
        return false;
    }
    return (numBoosters > 0);
}
// Validar la potencia de los propulsores
function validateBoostersPowers(boosterPowerCSV, numBoosters) {
    numBoosters = isNaNto0(numBoosters);
    var arr = boosterPowerCSV.split(',');
    // Falta o sobra potencia para algún propulsor
    if (arr.length != numBoosters) {
        return false;
    }
    // Hay algún valor no numérico
    for (var i = 0; i < arr.length; i++) {
        if (isNaN(convertStringToNumber(arr[i].trim()))) {
            return false;
        }
    }
    return true;
}
// Validar los campos del formulario Cohete
function validateRocket(form) {
    var errorFound = false;
    var validationObj = {
        code: { id: "rocketCode", msgErrorReq: "Código obligatorio", msgErrorFormato: "Formato incorrecto (8 carácteres alfanuméricos)." },
        numBoosters: { id: "rocketNumBoosters", msgErrorReq: "Nº de propulsores obligatorio", msgErrorFormato: "Formato incorrecto." },
        power: { id: "rocketPower", msgErrorReq: "Potencia de los propulsores obligatoria", msgErrorFormato: "Formato incorrecto." }
    };
    var inputCode = document.getElementById(validationObj.code.id);
    var inputNumBoosters = document.getElementById(validationObj.numBoosters.id);
    var inputPower = document.getElementById(validationObj.power.id);
    // Validate Rocket Code
    if (inputCode.value.trim().length == 0) {
        errorFound = true;
        setInvalidField(inputCode, validationObj.code.msgErrorReq);
    }
    else if (!validateRocketCode(inputCode.value)) {
        errorFound = true;
        setInvalidField(inputCode, validationObj.code.msgErrorFormato);
    }
    else {
        resetInvalidField(inputCode);
    }
    var _numBoosters = convertStringToNumber(inputNumBoosters.value);
    // Validate Rocket Num Boosters
    if (inputNumBoosters.value.trim().length == 0) {
        errorFound = true;
        setInvalidField(inputNumBoosters, validationObj.numBoosters.msgErrorReq);
    }
    else if (!validateNumBoosters(_numBoosters)) {
        errorFound = true;
        setInvalidField(inputNumBoosters, validationObj.numBoosters.msgErrorFormato);
    }
    else {
        resetInvalidField(inputNumBoosters);
    }
    // Trim Rocket Boosters Power Field
    var _power = inputPower.value.trim();
    var _arrPower = _power.split(',').map(function (v) {
        return v.trim();
    });
    _power = _arrPower.join(',');
    inputPower.value = _power;
    // Validate Rocket Boosters Power
    if (_power.length == 0) {
        errorFound = true;
        setInvalidField(inputPower, validationObj.power.msgErrorReq);
    }
    else if (!validateBoostersPowers(_power, _numBoosters)) {
        errorFound = true;
        setInvalidField(inputPower, validationObj.power.msgErrorFormato);
    }
    else {
        resetInvalidField(inputPower);
    }
    return !errorFound;
}
// Añadir un cohete a la tabla de cohetes
function addRocketToRace(rocket) {
    var rowPos = rockets.length;
    // Add rocket to table
    var tbody = document.getElementById('rocketsTableBody');
    var rocketRow = ROCKET_TABLE_TEMPLATE;
    var rocketJoystick = ROCKET_JOYSTICK_TEMPLATE;
    rocketRow = rocketRow
        .split('{{ROCKET_POS}}').join(rowPos.toString())
        .split('{{ROCKET_CODE}}').join(rocket.code)
        .split('{{ROCKET_NUM_BOOSTERS}}').join(rocket.numBoosters.toString())
        .split('{{ROCKET_BOOSTERS_POWERS}}').join(rocket.boostersPowerCSV())
        .split('{{ROCKET_POWER}}').join(rocket.totalPower().toString())
        .split('{{ROCKET_CURRENT_POWER}}').join(rocket.currentPower.toString())
        .split('{{ROCKET_REMAINING_POWER}}').join(rocket.remainingPower().toString())
        .split('{{ROCKET_JOYSTICK}}').join(rocketJoystick.split('{{ROCKET_POS}}').join(rocket.pos.toString()));
    var newRow = tbody.insertRow();
    newRow.id = "rocketRow" + rowPos.toString();
    newRow.innerHTML = rocketRow;
    // Add rocket to race lane
    var race = document.getElementById('race-stadium');
    var rocketRaceLane = ROCKET_RACE_LANE;
    rocketRaceLane = rocketRaceLane
        .split('{{ROCKET_POS}}').join(rocket.pos.toString())
        .split('{{ROCKET_CODE}}').join(rocket.code);
    var divTemp = document.createElement('div');
    divTemp.innerHTML = rocketRaceLane;
    race.appendChild(divTemp.childNodes[0]);
}
// Control de los "submit" (según el formulario que se envía)
function doSubmit(idForm) {
    var form;
    switch (idForm.toLowerCase()) {
        case 'rocketform':
            form = document.getElementById(idForm);
            if (validateRocket(form)) {
                var inputCode = document.getElementById('rocketCode');
                var inputNumBoosters = document.getElementById('rocketNumBoosters');
                var inputPower = document.getElementById('rocketPower');
                var _numBoosters = convertStringToNumber(inputNumBoosters.value);
                var _arrPower = inputPower.value.split(',');
                var _arrPowerNum = _arrPower.map(function (v) {
                    return convertStringToNumber(v);
                });
                createRocket(inputCode.value, _numBoosters, _arrPowerNum);
                addRocketToRace(rocket);
                // Clear fields
                inputCode.value = '';
                inputNumBoosters.value = '';
                inputPower.value = '';
                // Enable StartRace button
                var btnStartRace = document.getElementsByClassName("start-race-button");
                for (var i = 0; i < btnStartRace.length; i++) {
                    btnStartRace[i].classList.remove('disabled');
                }
            }
            break;
    }
    return false;
}
function accelerateRocket(rocketPos, acumulateAccelerations) {
    if (acumulateAccelerations === void 0) { acumulateAccelerations = true; }
    var rocket = rockets[rocketPos - 1];
    rocket.accelerate(APP_CONFIG.powerMovementUnit, rocketStep, acumulateAccelerations);
}
function accelerateAllRockets() {
    for (var i = 1; i <= rockets.length; i++) {
        accelerateRocket(i, false);
    }
}
function brakeRocket(rocketPos) {
    var rocket = rockets[rocketPos - 1];
    rocket.brake(APP_CONFIG.powerMovementUnit, rocketStep);
}
function brakeAllRockets() {
    for (var i = 1; i <= rockets.length; i++) {
        brakeRocket(i);
    }
}
function rocketRestart(rocketPos) {
    var rocket = rockets[rocketPos - 1];
    rocket.restart();
}
function restartRace() {
    for (var i = 1; i <= rockets.length; i++) {
        rocketRestart(i);
    }
}
/* Calcular el valor que tendrá cada "movimiento" del cohete */
function getRocketStepValue() {
    var outerspace = document.getElementById('race-stadium');
    var stepValue;
    stepValue = outerspace.offsetWidth / (APP_CONFIG.powerStepsToFinish * APP_CONFIG.powerMovementUnit);
    // Redondeamos con 2 decimales
    return Math.ceil(stepValue * 100) / 100;
}
