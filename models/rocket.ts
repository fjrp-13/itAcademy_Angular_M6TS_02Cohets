class Rocket{
    private PARAMS = {
        emptyClass: 'booster-empty',
        winnerClass: 'winner',
        disabledClass: 'disabled',
    };
    pos: number = -1;
    code:string;
    currentPower: number = 0;
    numBoosters:number;
    boosters:Booster[]=new Array();

    constructor(code:string, numBoosters:number, boostersPower:number[]){
        this.code = code;
        this.numBoosters = numBoosters;
        for (let bp of boostersPower) {
            this.addBooster(new Booster(bp));
        }
    }
    
    /* Añade un propulsor al cohete */
    addBooster(booster:Booster):void{
        this.boosters.push(booster);
    }

    /* Devuelve el nº de propulsores que tiene el cohete */
    numPropulsores():number {
        return this.boosters.length;
    }

    /* Devuelve un array con la potencia de los propulsores del cohete */
    boostersPower():number[] {
        let _powerList: number[] = new Array();
        for (let b of this.boosters) {
            _powerList.push(b.power);
        }
        return _powerList;
    }

    /* Devuelve en formato CSV la potencia de los propulsores del cohete */
    boostersPowerCSV():string {
        let _powerList: number[] = new Array();
        for (let b of this.boosters) {
            _powerList.push(b.power);
        }
        return _powerList.join(',');
    }
    
    /* Devuelve la potencia total del cohete */
    totalPower():number {
        let _totalPower: number = 0;
        for (let b of this.boosters) {
            _totalPower += b.power;
        }
        return _totalPower;
    }

    /* Devuelve la potencia restante del cohete */
    remainingPower():number {
        let _remainingPower: number = 0;
        for (let b of this.boosters) {
            _remainingPower += b.remainingPower;
        }
        return _remainingPower;
    }

    /* Resetea el cohete */
    restart():void {
        for (let b of this.boosters) {
            b.restart();
        }
        this.currentPower = 0;
        this.resetRocket();
    }

    /* Acelera el cohete
        @Params:
        - powerMovemenUnid: unidades del propulsor a utilizar
        - rocketStep: valor de cada movimiento/desplazamiento del cohete
        - acumulateAccelerations:
            true = cada aceleración, deberá recuperarse con frenazo (aunque no tenga potencia)
                    si aceleramos 2 veces sin potencia, para recuperar la potencia deberemos frenar 2 veces
            false = una aceleración sin potencia, no hace nada
    */
    accelerate(powerMovementUnit:number, rocketStep:number, acumulateAccelerations:boolean = true):void {
        let _movementPower: number = 0;
        if (this.remainingPower() > 0) {
            for (let b of this.boosters) {
                // Mirar si al propulsor le queda potencia
                if (b.remainingPower > 0) {
                    // Si no le queda suficiente potencia para un impulso completo, usamos la potencia que le queda
                    if (b.remainingPower < powerMovementUnit ) {
                        _movementPower += b.remainingPower;
                        b.remainingPower = 0;
                        b.usedPower += b.remainingPower;
                    } else {
                        _movementPower += powerMovementUnit;
                        b.remainingPower -= powerMovementUnit;
                        b.usedPower += powerMovementUnit;
                    }
                } else if (acumulateAccelerations){
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
    }

    /* Frena el cohete
        @Params:
        - powerMovemenUnid: unidades del propulsor a utilizar
        - rocketStep: valor de cada movimiento/desplazamiento del cohete
    */
    brake(powerMovementUnit:number, rocketStep:number):void{
        // Si no ha usado potencia, no puede retroceder
        if (this.currentPower == 0) {
            return;
        }

        let _movementPower: number = 0;

        for (let b of this.boosters) {
            // Mirar si el propulsor tiene potencia recuperable
            if (b.usedPower > 0) {
                if (b.usedPower > b.power) {
                    // Recuperar la "potencia no utilizada" por haberla gastado
                    b.usedPower -= powerMovementUnit;
                } else {
                    // Si NO tiene suficiente potencia recuperable para un impulso completo, usamos la potencia recuperable que tenga
                    if (b.usedPower < powerMovementUnit ) {
                        _movementPower += b.usedPower;
                        b.remainingPower += b.usedPower;
                        b.usedPower = 0;
                    } else {
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
    }

    /* Actualiza el cohete
    @Params:
    - rocketStep: valor de cada movimiento/desplazamiento del cohete
    */
    private updateRocket(rocketStep:number) {
        // Update rocket in the table
        let row: HTMLTableRowElement = <HTMLTableRowElement> document.getElementById('rocketRow' + this.pos.toString());
        let colCurrentPower: HTMLTableColElement = <HTMLTableColElement> row.getElementsByClassName('current-power')[0];
        let colRemainingPower: HTMLTableColElement = <HTMLTableColElement> row.getElementsByClassName('remaining-power')[0];

        colCurrentPower.innerText = this.currentPower.toString();
        colRemainingPower.innerText = this.remainingPower().toString();

        // Move rocket icon
        this.moveIcon(rocketStep);

        if (this.remainingPower() > 0) {
            let iconRocket: HTMLDivElement = <HTMLDivElement> document.getElementById("rocket-" + this.pos.toString());
            iconRocket.classList.remove(this.PARAMS.emptyClass);
        } else {
            let iconRocket: HTMLDivElement = <HTMLDivElement> document.getElementById("rocket-" + this.pos.toString());
            iconRocket.classList.add(this.PARAMS.emptyClass);
        }
    }
    
    /* Resetea el cohete */
    private resetRocket() {
        // Update rocket in the table
        let row: HTMLTableRowElement = <HTMLTableRowElement> document.getElementById('rocketRow' + this.pos.toString());
        let colCurrentPower: HTMLTableColElement = <HTMLTableColElement> row.getElementsByClassName('current-power')[0];
        let colRemainingPower: HTMLTableColElement = <HTMLTableColElement> row.getElementsByClassName('remaining-power')[0];

        colCurrentPower.innerText = this.currentPower.toString();
        colRemainingPower.innerText = this.remainingPower().toString();

        this.resetIcon();
        this.checkEmpty();
        this.winner(false); // desmarca el ganador
        this.disableJoysticks(false); // habilita los joysticks
    }

    /* Revisa si al cohete le queda potencia. Si no le queda, lo marca como "vacío" */
    private checkEmpty() {
        let iconRocket: HTMLDivElement = <HTMLDivElement> document.getElementById("rocket-" + this.pos.toString());
        if (this.remainingPower() > 0) {
            iconRocket.classList.remove(this.PARAMS.emptyClass);
        } else {
            iconRocket.classList.add(this.PARAMS.emptyClass);
        }
    }

    /* Resetea el icono del cohete al inicio de la carrera */
    private resetIcon() {
        let iconRocket: HTMLDivElement = <HTMLDivElement> document.getElementById("rocket-" + this.pos.toString());
        let raceStadium: HTMLDivElement = <HTMLDivElement> iconRocket.closest('#race-stadium')
        iconRocket.style.left = "0px";
    }

    /* Mueve el icono del cohete
        @Params:
        - rocketStep: valor de cada movimiento/desplazamiento del cohete
    */
    private moveIcon(rocketStep:number) {
        let iconRocket: HTMLDivElement = <HTMLDivElement> document.getElementById('rocket-' + this.pos.toString());
        let raceLane: HTMLDivElement = <HTMLDivElement> iconRocket.closest('.rocket-lane');
        let raceStadium: HTMLDivElement = <HTMLDivElement> iconRocket.closest('#race-stadium')
        let finishLine = raceStadium.offsetWidth;
        let rocketWidth = iconRocket.offsetWidth;
        let newIconLeft = Math.ceil(this.currentPower * rocketStep);
        raceLane.style.paddingLeft = newIconLeft.toString() + "px";
        if (newIconLeft + rocketWidth >= finishLine) {
            this.winner(true);
        }
    }

    /* Marca el cohete como ganador
        @Params:
        - isWinner:
            true: marca el cohete como ganador
            false: desmarca el cohete como ganador
    */
    private winner(isWinner: boolean):void {
        let iconRocket: HTMLDivElement = <HTMLDivElement> document.getElementById("rocket-" + this.pos.toString());
        let raceLane: HTMLDivElement = <HTMLDivElement> iconRocket.closest('.rocket-lane')
        if (isWinner) {
            let _rocket = this;
            setTimeout(function () {
                raceLane.classList.add(_rocket.PARAMS.winnerClass);
                raceLane.style.paddingLeft = "";
            }, 1000);
        } else {
            raceLane.classList.remove(this.PARAMS.winnerClass);
            raceLane.style.paddingLeft = "";
        }
        this.disableJoysticks(isWinner);
    }

    /* Habilita/deshabilita los joystick
        @Params:
            true: deshabilita los joysticks
            false: habilita los joysticks
    */
    private disableJoysticks(disable: boolean) {
        let joystick: HTMLCollection = <HTMLCollection> document.getElementsByClassName('rocket-joystick-item');
        for (let i=0; i<joystick.length; i++) {
            if (disable) {
                joystick[i].classList.add(this.PARAMS.disabledClass);
            } else {
                joystick[i].classList.remove(this.PARAMS.disabledClass);
            }
        }
    }
}
