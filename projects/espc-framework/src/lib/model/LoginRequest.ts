
export class LoginRequest
    {
        
        public Password: string;
        public UserName: string;
        public credentials: any;

        constructor(setup: Partial<LoginRequest> )
        {
            console.log(setup);
            this.UserName = setup.UserName;
            this.Password = setup.Password;
            this.credentials = {};
            for(const key in setup) {
                if (!(['Password', 'UserName'].find((i) => i === key))) {
                    this.credentials[key] = setup[key].toString();
                }
            }

        }
    }
