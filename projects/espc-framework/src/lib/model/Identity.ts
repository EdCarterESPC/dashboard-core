
export class Identity {

    public userId: number;
    public username: string;
    public firstName: string;
    public lastName: string;

    public authentications: any;

    public constructor(u: Partial<Identity>) {
        Object.assign(this, u);
    }

}
