class Booster{
    public power:number;
    public remainingPower:number;
    public usedPower:number;

    constructor(power:number){
        this.power=power;
        this.remainingPower=power;
        this.usedPower=0;
    }

    restart():void {
        this.remainingPower=this.power;
        this.usedPower=0;
    }
}