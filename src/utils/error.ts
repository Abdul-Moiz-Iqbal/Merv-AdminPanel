
export class AppError extends Error{
    public readonly type:string;
    public readonly code:number;
    public readonly details?:any;

    constructor(
        type: string,
        message:string,
        code:number,
        details?:any
    ){
        super(message)
        this.type = type;
        this.code = code
        this.details = details;
        this.name = "App error";
    
    }

    static invalidCredentials(details?:any){
        return new AppError("UNAUTHORIZED", "Invalid Credentials", 401, details)
    }

}