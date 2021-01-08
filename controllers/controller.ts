// Objeto genérico con configuraciones de la aplicación
const APP_CONFIG = {
    errorFieldSuffix: "Error",
    invalidClass: 'is-invalid',
    rocketCodeRegExp: '^[0-9a-zA-Z]{8}$',
    rocketPowerRegExp: '^(\\d+)(,\\s*\\d+)*$',
    powerMovementUnit: 10,
    powerStepsToFinish: 12,
};
// Calculamos el valor de cada STEP del cohete (redondeado a 2 decimales)
const rocketStep = getRocketStepValue();

/*-------------------- FUNCIONES GENÉRICAS (ini) --------------------*/
// Resetear los campos "invalid" (quitar clase y vaciar su "invalid-feedback" asociado)
const resetInvalidField = function(field: HTMLInputElement) {
    field.classList.remove(APP_CONFIG.invalidClass);
    let invalid = <HTMLElement> document.getElementById(field.id + APP_CONFIG.errorFieldSuffix);
    invalid.textContent = '';
}

// Marcar un campo como "invalid" y añadir el mensaje a su "invalid-feedback" asociado
const setInvalidField = function (field: HTMLInputElement, errorMsg: string) {
    field.classList.add(APP_CONFIG.invalidClass);
    let invalid = <HTMLElement> document.getElementById(field.id + APP_CONFIG.errorFieldSuffix);
    invalid.textContent = errorMsg;
};

// Convertir un string a number
const convertStringToNumber = function(input: string) { 
    if (!input) return NaN;

    if (input.trim().length==0) { 
        return NaN;
    }
    return Number(input);
}

// Convertir un NaN a 0
const isNaNto0 = function(num: number) {
    if (isNaN(num)) {
        num = 0;
    }
    return num;
}
/*-------------------- FUNCIONES GENÉRICAS (fin) --------------------*/

/*-------------------- TEMPLATES HTML (ini) --------------------*/
// Template para crear las filas de la tabla de cohetes
const ROCKET_TABLE_TEMPLATE = [
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
const ROCKET_JOYSTICK_TEMPLATE = [
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
    '</ul>'//,
//'</nav>'
].join('');

// Template para crear la línea de carrera del cohete
const ROCKET_RACE_LANE = [
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
let rockets: Rocket[] = [];
let rocket: Rocket;

// Crear un elemento "Rocket" y lo añade al array
function createRocket(code:string, numBoosters:number, boostersPower:number[]){
    rocket = new Rocket(code, numBoosters, boostersPower);
    rockets.push(rocket);
    rocket.pos = rockets.length
}

// Validar el formato del código del cohete
function validateRocketCode(rocketCode: string): boolean {
    const regexp = new RegExp(APP_CONFIG.rocketCodeRegExp, 'gi');
    return regexp.test(rocketCode);
}
// Validar el nº de propulsores
function validateNumBoosters(numBoosters: number): boolean {
    if (isNaN(numBoosters)) {
        return false;
    }
    return (numBoosters > 0);
}

// Validar la potencia de los propulsores
function validateBoostersPowers(boosterPowerCSV: string, numBoosters:number): boolean {
    numBoosters = isNaNto0(numBoosters);
    let arr = boosterPowerCSV.split(',');
    // Falta o sobra potencia para algún propulsor
    if (arr.length != numBoosters) {
        return false;
    }

    // Hay algún valor no numérico
    for(let i=0; i < arr.length; i++) {
        if (isNaN(convertStringToNumber(arr[i].trim()))) {
            return false;
        }
    }

    return true;
}

// Validar los campos del formulario Cohete
function validateRocket(form: HTMLFormElement): boolean {
    let errorFound: boolean = false;
    let validationObj = {
        code: { id: "rocketCode", msgErrorReq: "Código obligatorio", msgErrorFormato: "Formato incorrecto." },
        numBoosters: { id: "rocketNumBoosters", msgErrorReq: "Nº de propulsores obligatorio", msgErrorFormato: "Formato incorrecto." },
        power: { id: "rocketPower", msgErrorReq: "Potencia de los propulsores obligatoria", msgErrorFormato: "Formato incorrecto." }
    };
    let inputCode: HTMLInputElement = <HTMLInputElement> document.getElementById(validationObj.code.id);
    let inputNumBoosters: HTMLInputElement = <HTMLInputElement> document.getElementById(validationObj.numBoosters.id);
    let inputPower: HTMLInputElement = <HTMLInputElement> document.getElementById(validationObj.power.id);

    // Validate Rocket Code
    if (inputCode.value.trim().length == 0) {
        errorFound = true;
        setInvalidField(inputCode, validationObj.code.msgErrorReq);
    } else if (!validateRocketCode(inputCode.value)) {
        errorFound = true;
        setInvalidField(inputCode, validationObj.code.msgErrorFormato);
    } else {
        resetInvalidField(inputCode);
    }
    
    let _numBoosters = convertStringToNumber(inputNumBoosters.value);
    // Validate Rocket Num Boosters
    if (inputNumBoosters.value.trim().length == 0) {
        errorFound = true;
        setInvalidField(inputNumBoosters, validationObj.numBoosters.msgErrorReq);
    } else if (!validateNumBoosters(_numBoosters)) {
        errorFound = true;
        setInvalidField(inputNumBoosters, validationObj.numBoosters.msgErrorFormato);
    } else {
        resetInvalidField(inputNumBoosters);
    }
    
    // Trim Rocket Boosters Power Field
    let _power = inputPower.value.trim();
    let _arrPower = _power.split(',').map((v) => {
        return v.trim();
    });
    _power = _arrPower.join(',');
    inputPower.value = _power;

    // Validate Rocket Boosters Power
    if (_power.length == 0) {
        errorFound = true;
        setInvalidField(inputPower, validationObj.power.msgErrorReq);
    } else if (!validateBoostersPowers(_power, _numBoosters)) {
        errorFound = true;
        setInvalidField(inputPower, validationObj.power.msgErrorFormato);
    } else {
        resetInvalidField(inputPower);
    }
    
    return !errorFound;
}

// Añadir un cohete a la tabla de cohetes
function addRocketToRace(rocket: Rocket) {
    const rowPos = rockets.length;
    
    // Add rocket to table
    let tbody: HTMLTableElement = <HTMLTableElement> document.getElementById('rocketsTableBody');
    let rocketRow = ROCKET_TABLE_TEMPLATE;
    let rocketJoystick = ROCKET_JOYSTICK_TEMPLATE;
    rocketRow = rocketRow
        .split('{{ROCKET_POS}}').join(rowPos.toString())
        .split('{{ROCKET_CODE}}').join(rocket.code)
        .split('{{ROCKET_NUM_BOOSTERS}}').join(rocket.numBoosters.toString())
        .split('{{ROCKET_BOOSTERS_POWERS}}').join(rocket.boostersPowerCSV())
        .split('{{ROCKET_POWER}}').join(rocket.totalPower().toString())
        .split('{{ROCKET_CURRENT_POWER}}').join(rocket.currentPower.toString())
        .split('{{ROCKET_REMAINING_POWER}}').join(rocket.remainingPower().toString())
        .split('{{ROCKET_JOYSTICK}}').join(rocketJoystick.split('{{ROCKET_POS}}').join(rocket.pos.toString()))
        ;
    let newRow = <HTMLTableRowElement> tbody.insertRow();
    newRow.id = "rocketRow" + rowPos.toString();
    newRow.innerHTML = rocketRow;

    // Add rocket to race lane
    let race: HTMLDivElement = <HTMLDivElement> document.getElementById('race-stadium');
    let rocketRaceLane = ROCKET_RACE_LANE;
    rocketRaceLane = rocketRaceLane
        .split('{{ROCKET_POS}}').join(rocket.pos.toString())
        .split('{{ROCKET_CODE}}').join(rocket.code)
    ;

    let divTemp: HTMLDivElement = <HTMLDivElement> document.createElement('div');
    divTemp.innerHTML = rocketRaceLane;
    
    race.appendChild(divTemp.childNodes[0]);
}

// Control de los "submit" (según el formulario que se envía)
function doSubmit(idForm: string): boolean {
    let form: HTMLFormElement;
    switch (idForm.toLowerCase()) {
        case 'rocketform':
            form = <HTMLFormElement> document.getElementById(idForm);
            if (validateRocket(form)) {
                let inputCode: HTMLInputElement = <HTMLInputElement> document.getElementById('rocketCode');
                let inputNumBoosters: HTMLInputElement = <HTMLInputElement> document.getElementById('rocketNumBoosters');
                let inputPower: HTMLInputElement = <HTMLInputElement> document.getElementById('rocketPower');
                
                let _numBoosters = convertStringToNumber(inputNumBoosters.value);
                let _arrPower = inputPower.value.split(',');
                let _arrPowerNum = _arrPower.map(v => {
                    return convertStringToNumber(v);
                }); 
                createRocket(inputCode.value, _numBoosters, _arrPowerNum);
                addRocketToRace(rocket);

                // Clear fields
                inputCode.value = '';
                inputNumBoosters.value = '';
                inputPower.value = '';

                // Enable StartRace button
                let btnStartRace: HTMLCollection = <HTMLCollection> document.getElementsByClassName("start-race-button");
                for (let i=0; i<btnStartRace.length; i++) {
                    btnStartRace[i].classList.remove('disabled');
                }
            }
            break;
    }
    return false;
}

function accelerateRocket(rocketPos: number, acumulateAccelerations: boolean=true) {
    let rocket = rockets[rocketPos - 1];
    rocket.accelerate(APP_CONFIG.powerMovementUnit, rocketStep, acumulateAccelerations);
}

function accelerateAllRockets() {
    for (let i=1; i<= rockets.length; i++) {
        accelerateRocket(i, false);
    }
}

function brakeRocket(rocketPos: number) {
    let rocket = rockets[rocketPos - 1];
    rocket.brake(APP_CONFIG.powerMovementUnit, rocketStep);
}

function brakeAllRockets() {
    for (let i=1; i<= rockets.length; i++) {
        brakeRocket(i);
    }
}

function rocketRestart(rocketPos: number) {
    let rocket = rockets[rocketPos - 1];
    rocket.restart();
}

function restartRace() {
    for (let i=1; i<= rockets.length; i++) {
        rocketRestart(i)
    }
}

/* Calcular el valor que tendrá cada "movimiento" del cohete */
function getRocketStepValue() {
    let outerspace = <HTMLDivElement> document.getElementById('race-stadium');
    
    let stepValue: number;

    stepValue = outerspace.offsetWidth / (APP_CONFIG.powerStepsToFinish * APP_CONFIG.powerMovementUnit);
    // Redondeamos con 2 decimales
    return Math.ceil(stepValue * 100) / 100;
}